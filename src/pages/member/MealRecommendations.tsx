import { useEffect, useMemo, useState } from 'react';
import {
  Check,
  ChevronRight,
  Loader2,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  Utensils,
} from 'lucide-react';

import MemberLayout from '../../components/member/MemberLayout';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

type MealTime = 'day' | 'night';

type Meal = {
  id: string;
  date: string;
  day_menu_name: string | null;
  day_menu_image: string | null;
  night_menu_name: string | null;
  night_menu_image: string | null;
};

type MealRecord = {
  meal_id: string;
  day_meal: boolean;
  night_meal: boolean;
  created_at: string;
  meals:
    | {
        id: string;
        date: string;
        day_menu_name: string | null;
        night_menu_name: string | null;
      }
    | {
        id: string;
        date: string;
        day_menu_name: string | null;
        night_menu_name: string | null;
      }[]
    | null;
};

type Feedback = {
  meal_id: string;
  meal_time: MealTime;
  action: 'accepted' | 'rejected';
};

type Recommendation = {
  mealId: string;
  mealTime: MealTime;
  name: string;
  image: string | null;
  score: number;
  historyCount: number;
  recentCount: number;
  accepted: number;
  rejected: number;
  popularity: number;
};

function normalizeMealName(value: string | null | undefined) {
  return (value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

function dateDaysAgo(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

export default function MealRecommendations() {
  const { profile } = useAuth();

  const [todayMeal, setTodayMeal] = useState<Meal | null>(null);
  const [records, setRecords] = useState<MealRecord[]>([]);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [hostelPopularity, setHostelPopularity] = useState<
    Record<string, number>
  >({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  const memberId = (profile as any)?.id;
  const hostelId = (profile as any)?.hostel_id;

  const isDark =
    typeof window !== 'undefined' &&
    localStorage.getItem('memberTheme') !== 'light';

  useEffect(() => {
    if (memberId && hostelId) {
      loadRecommendationData();
    }
  }, [memberId, hostelId]);

  async function loadRecommendationData() {
    try {
      setLoading(true);
      setMessage('');

      const today = new Date().toISOString().slice(0, 10);
      const fromDate = dateDaysAgo(30);

      const { data: meal, error: mealError } = await supabase
        .from('meals')
        .select(
          `
            id,
            date,
            day_menu_name,
            day_menu_image,
            night_menu_name,
            night_menu_image
          `
        )
        .eq('hostel_id', hostelId)
        .eq('date', today)
        .maybeSingle();

      if (mealError) throw mealError;

      setTodayMeal((meal || null) as Meal | null);

      const { data: recordData, error: recordError } = await supabase
        .from('meal_records')
        .select(
          `
            meal_id,
            day_meal,
            night_meal,
            created_at,
            meals!inner (
              id,
              date,
              day_menu_name,
              night_menu_name
            )
          `
        )
        .eq('member_id', memberId)
        .gte('created_at', `${fromDate}T00:00:00`)
        .order('created_at', { ascending: false });

      if (recordError) throw recordError;

      setRecords((recordData || []) as MealRecord[]);

      const { data: feedbackData, error: feedbackError } = await supabase
        .from('meal_recommendation_feedback')
        .select('meal_id, meal_time, action')
        .eq('member_id', memberId);

      if (feedbackError) throw feedbackError;

      setFeedback((feedbackData || []) as Feedback[]);

      /*
       * Hostel popularity:
       * We count how many members selected each menu item
       * during the last 30 days.
       */
      const { data: hostelRecords, error: hostelRecordsError } =
        await supabase
          .from('meal_records')
          .select(
            `
              day_meal,
              night_meal,
              meals!inner (
                hostel_id,
                date,
                day_menu_name,
                night_menu_name
              )
            `
          )
          .eq('meals.hostel_id', hostelId)
          .gte('meals.date', fromDate)
          .lte('meals.date', today);

      if (hostelRecordsError) throw hostelRecordsError;

      const popularity: Record<string, number> = {};

      for (const item of hostelRecords || []) {
        const row: any = item;
        const mealRow = Array.isArray(row.meals)
          ? row.meals[0]
          : row.meals;

        if (!mealRow) continue;

        if (row.day_meal && mealRow.day_menu_name) {
          const key = normalizeMealName(mealRow.day_menu_name);
          popularity[key] = (popularity[key] || 0) + 1;
        }

        if (row.night_meal && mealRow.night_menu_name) {
          const key = normalizeMealName(mealRow.night_menu_name);
          popularity[key] = (popularity[key] || 0) + 1;
        }
      }

      setHostelPopularity(popularity);
    } catch (error: any) {
      console.error('Recommendation load error:', error);
      setMessage(
        error?.message || 'Could not load meal recommendations.'
      );
    } finally {
      setLoading(false);
    }
  }

  const recommendations = useMemo(() => {
    if (!todayMeal) return [];

    const candidates: {
      mealId: string;
      mealTime: MealTime;
      name: string;
      image: string | null;
    }[] = [];

    if (todayMeal.day_menu_name?.trim()) {
      candidates.push({
        mealId: todayMeal.id,
        mealTime: 'day',
        name: todayMeal.day_menu_name.trim(),
        image: todayMeal.day_menu_image,
      });
    }

    if (todayMeal.night_menu_name?.trim()) {
      candidates.push({
        mealId: todayMeal.id,
        mealTime: 'night',
        name: todayMeal.night_menu_name.trim(),
        image: todayMeal.night_menu_image,
      });
    }

    return candidates
      .map((candidate): Recommendation => {
        const key = normalizeMealName(candidate.name);

        let historyCount = 0;
        let recentCount = 0;

        for (const record of records) {
          const mealRow: any = Array.isArray(record.meals)
            ? record.meals[0]
            : record.meals;

          if (!mealRow) continue;

          const selectedName =
            candidate.mealTime === 'day'
              ? mealRow.day_menu_name
              : mealRow.night_menu_name;

          /*
           * Compare today's candidate with the historical menu item
           * selected at the same meal time.
           */
          if (
            normalizeMealName(selectedName) === key &&
            ((candidate.mealTime === 'day' && record.day_meal) ||
              (candidate.mealTime === 'night' && record.night_meal))
          ) {
            historyCount += 1;

            const recordDate =
              mealRow.date || record.created_at?.slice(0, 10);

            if (recordDate && recordDate >= dateDaysAgo(7)) {
              recentCount += 1;
            }
          }
        }

        const accepted = feedback.filter(
          (item) =>
            item.meal_time === candidate.mealTime &&
            item.action === 'accepted' &&
            item.meal_id !== candidate.mealId
        ).length;

        const rejected = feedback.filter(
          (item) =>
            item.meal_time === candidate.mealTime &&
            item.action === 'rejected' &&
            item.meal_id !== candidate.mealId
        ).length;

        const popularity = hostelPopularity[key] || 0;

        /*
         * Simple explainable recommendation score.
         * It is deliberately rule-based so the result is transparent.
         */
        const historyScore = Math.min(historyCount * 12, 48);
        const recentScore = Math.min(recentCount * 7, 21);
        const popularityScore = Math.min(popularity * 2, 15);
        const feedbackBonus = Math.min(accepted * 5, 10);
        const feedbackPenalty = Math.min(rejected * 10, 25);

        const rawScore =
          35 +
          historyScore +
          recentScore +
          popularityScore +
          feedbackBonus -
          feedbackPenalty;

        const score = Math.max(20, Math.min(99, rawScore));

        return {
          ...candidate,
          score,
          historyCount,
          recentCount,
          accepted,
          rejected,
          popularity,
        };
      })
      .sort((a, b) => b.score - a.score);
  }, [todayMeal, records, feedback, hostelPopularity]);

  const recommended = recommendations[0] || null;
  const lowPreference =
    recommendations.length > 1 ? recommendations[recommendations.length - 1] : null;

  async function saveFeedback(
    recommendation: Recommendation,
    action: 'accepted' | 'rejected'
  ) {
    try {
      setSaving(`${recommendation.mealId}-${recommendation.mealTime}-${action}`);

      const { error } = await supabase
        .from('meal_recommendation_feedback')
        .upsert(
          {
            member_id: memberId,
            meal_id: recommendation.mealId,
            meal_time: recommendation.mealTime,
            action,
          },
          {
            onConflict: 'member_id,meal_id,meal_time',
          }
        );

      if (error) throw error;

      setFeedback((current) => {
        const filtered = current.filter(
          (item) =>
            !(
              item.meal_id === recommendation.mealId &&
              item.meal_time === recommendation.mealTime
            )
        );

        return [
          ...filtered,
          {
            meal_id: recommendation.mealId,
            meal_time: recommendation.mealTime,
            action,
          },
        ];
      });

      setMessage(
        action === 'accepted'
          ? 'Thanks! We will use your choice to improve future recommendations.'
          : 'Got it! We will reduce similar recommendations in the future.'
      );
    } catch (error: any) {
      console.error('Recommendation feedback error:', error);
      setMessage(
        error?.message || 'Could not save your recommendation feedback.'
      );
    } finally {
      setSaving(null);
    }
  }

  if (loading) {
    return (
      <MemberLayout>
        <div className="min-h-[70vh] flex items-center justify-center">
          <Loader2 className="w-9 h-9 animate-spin text-indigo-500" />
        </div>
      </MemberLayout>
    );
  }

  return (
    <MemberLayout>
      <div className="w-full max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div
              className={`p-3 rounded-2xl ${
                isDark
                  ? 'bg-indigo-500/10 text-indigo-400'
                  : 'bg-indigo-50 text-indigo-600'
              }`}
            >
              <Sparkles size={25} />
            </div>

            <div>
              <h1
                className={`text-3xl sm:text-4xl font-extrabold ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                Recommended For You
              </h1>

              <p className="text-sm text-slate-500 mt-1">
                Personalized suggestions based on your meal history.
              </p>
            </div>
          </div>
        </div>

        {message && (
          <div
            className={`mb-6 rounded-2xl border px-5 py-4 text-sm ${
              isDark
                ? 'border-white/10 bg-white/5 text-slate-300'
                : 'border-slate-200 bg-white text-slate-600 shadow-sm'
            }`}
          >
            {message}
          </div>
        )}

        {!todayMeal ? (
          <div
            className={`rounded-3xl border p-10 text-center ${
              isDark
                ? 'bg-slate-800/60 border-white/5'
                : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            <Utensils
              className="mx-auto text-slate-400"
              size={42}
            />

            <h2
              className={`text-xl font-bold mt-4 ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              No menu available today
            </h2>

            <p className="text-sm text-slate-500 mt-2">
              Once today's menu is added, personalized recommendations will
              appear here.
            </p>
          </div>
        ) : recommendations.length === 0 ? (
          <div
            className={`rounded-3xl border p-10 text-center ${
              isDark
                ? 'bg-slate-800/60 border-white/5'
                : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            <Utensils
              className="mx-auto text-slate-400"
              size={42}
            />

            <h2
              className={`text-xl font-bold mt-4 ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              No recommendation yet
            </h2>

            <p className="text-sm text-slate-500 mt-2">
              Your manager has not added a meal name for today yet.
            </p>
          </div>
        ) : (
          <>
            <section
              className={`rounded-3xl border overflow-hidden ${
                isDark
                  ? 'bg-slate-800/60 border-white/5'
                  : 'bg-white border-slate-200 shadow-sm'
              }`}
            >
              <div className="p-5 sm:p-7">
                <div className="flex items-center justify-between gap-4 mb-6">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 px-3 py-1.5 text-xs font-bold text-indigo-500">
                      <Sparkles size={14} />
                      AI-style personalized suggestion
                    </div>

                    <h2
                      className={`text-2xl font-extrabold mt-3 ${
                        isDark ? 'text-white' : 'text-slate-900'
                      }`}
                    >
                      Best Match For You
                    </h2>
                  </div>

                  <div className="text-right">
                    <div className="text-3xl font-black text-indigo-600">
                      {recommended?.score}%
                    </div>
                    <div className="text-xs text-slate-500 font-semibold">
                      match
                    </div>
                  </div>
                </div>

                {recommended && (
                  <div className="grid lg:grid-cols-[280px_1fr] gap-7 items-center">
                    <div className="relative">
                      <div className="aspect-[4/3] rounded-3xl overflow-hidden bg-slate-100">
                        {recommended.image ? (
                          <img
                            src={recommended.image}
                            alt={recommended.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Utensils
                              size={52}
                              className="text-slate-300"
                            />
                          </div>
                        )}
                      </div>

                      <div className="absolute top-3 left-3 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-indigo-700 shadow">
                        {recommended.mealTime === 'day'
                          ? '☀️ Day Meal'
                          : '🌙 Night Meal'}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-widest font-bold text-slate-500">
                        Recommended Meal
                      </p>

                      <h3
                        className={`text-3xl font-black mt-2 ${
                          isDark ? 'text-white' : 'text-slate-900'
                        }`}
                      >
                        {recommended.name}
                      </h3>

                      <div className="grid sm:grid-cols-3 gap-3 mt-6">
                        <div className="rounded-2xl bg-indigo-500/10 p-4">
                          <div className="text-2xl font-black text-indigo-600">
                            {recommended.historyCount}
                          </div>
                          <div className="text-xs text-slate-500 mt-1">
                            Previous choices
                          </div>
                        </div>

                        <div className="rounded-2xl bg-emerald-500/10 p-4">
                          <div className="text-2xl font-black text-emerald-600">
                            {recommended.recentCount}
                          </div>
                          <div className="text-xs text-slate-500 mt-1">
                            Choices in 7 days
                          </div>
                        </div>

                        <div className="rounded-2xl bg-amber-500/10 p-4">
                          <div className="text-2xl font-black text-amber-600">
                            {recommended.popularity}
                          </div>
                          <div className="text-xs text-slate-500 mt-1">
                            Mess selections
                          </div>
                        </div>
                      </div>

                      <p className="text-sm text-slate-500 mt-5 leading-6">
                        This recommendation is based on your previous meal
                        selections, recent choices, feedback, and the meal's
                        popularity in your mess.
                      </p>

                      <div className="flex flex-wrap gap-3 mt-6">
                        <button
                          onClick={() =>
                            saveFeedback(recommended, 'accepted')
                          }
                          disabled={saving !== null}
                          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-50"
                        >
                          {saving?.includes('accepted') ? (
                            <Loader2
                              size={17}
                              className="animate-spin"
                            />
                          ) : (
                            <ThumbsUp size={17} />
                          )}
                          Take This Meal
                        </button>

                        <button
                          onClick={() =>
                            saveFeedback(recommended, 'rejected')
                          }
                          disabled={saving !== null}
                          className={`inline-flex items-center gap-2 rounded-xl border px-5 py-3 text-sm font-bold ${
                            isDark
                              ? 'border-white/10 text-slate-300 hover:bg-white/5'
                              : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                          } disabled:opacity-50`}
                        >
                          {saving?.includes('rejected') ? (
                            <Loader2
                              size={17}
                              className="animate-spin"
                            />
                          ) : (
                            <ThumbsDown size={17} />
                          )}
                          Not Interested
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {lowPreference &&
              lowPreference.mealId !== recommended?.mealId &&
              lowPreference.mealTime !== recommended?.mealTime && (
                <section className="mt-6">
                  <div
                    className={`rounded-3xl border p-6 ${
                      isDark
                        ? 'bg-slate-800/60 border-white/5'
                        : 'bg-white border-slate-200 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-slate-100">
                        <ChevronRight
                          size={18}
                          className="text-slate-500"
                        />
                      </div>

                      <div>
                        <h3
                          className={`text-lg font-extrabold ${
                            isDark ? 'text-white' : 'text-slate-900'
                          }`}
                        >
                          You May Want to Skip
                        </h3>

                        <p className="text-xs text-slate-500 mt-1">
                          This is not a negative judgment—it's simply a lower
                          match based on your recorded choices.
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-col sm:flex-row gap-5 items-center">
                      <div className="w-full sm:w-36 h-28 rounded-2xl overflow-hidden bg-slate-100 shrink-0">
                        {lowPreference.image ? (
                          <img
                            src={lowPreference.image}
                            alt={lowPreference.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Utensils className="text-slate-300" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 w-full">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-xs uppercase tracking-wider font-bold text-slate-500">
                              {lowPreference.mealTime === 'day'
                                ? 'Day Meal'
                                : 'Night Meal'}
                            </p>

                            <h4
                              className={`text-xl font-black mt-1 ${
                                isDark
                                  ? 'text-white'
                                  : 'text-slate-900'
                              }`}
                            >
                              {lowPreference.name}
                            </h4>
                          </div>

                          <div className="text-right">
                            <div className="text-2xl font-black text-slate-500">
                              {lowPreference.score}%
                            </div>
                            <div className="text-xs text-slate-500">
                              match
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              )}

            <section className="mt-6 grid md:grid-cols-3 gap-4">
              {recommendations.map((item) => (
                <div
                  key={`${item.mealId}-${item.mealTime}`}
                  className={`rounded-2xl border p-4 ${
                    isDark
                      ? 'bg-slate-800/60 border-white/5'
                      : 'bg-white border-slate-200 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        {item.mealTime === 'day'
                          ? 'Day'
                          : 'Night'}
                      </p>

                      <h4
                        className={`font-bold mt-1 ${
                          isDark ? 'text-white' : 'text-slate-900'
                        }`}
                      >
                        {item.name}
                      </h4>
                    </div>

                    <div className="text-lg font-black text-indigo-600">
                      {item.score}%
                    </div>
                  </div>

                  <div className="mt-4 h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-indigo-600"
                      style={{
                        width: `${item.score}%`,
                      }}
                    />
                  </div>

                  <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                    <Check size={14} />
                    Based on your meal history
                  </div>
                </div>
              ))}
            </section>
          </>
        )}
      </div>
    </MemberLayout>
  );
}
