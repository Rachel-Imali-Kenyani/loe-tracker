import { createClient } from 'npm:@supabase/supabase-js@2.56.0';

type ReminderUser = {
  user_id: string;
  missing_days: number;
  missing_hours: number;
};

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.');
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

function getMonthBounds(today: Date) {
  const year = today.getUTCFullYear();
  const month = today.getUTCMonth();
  const start = new Date(Date.UTC(year, month, 1));
  const end = new Date(Date.UTC(year, month + 1, 0));
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
    dueDateLabel: end.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC',
    }),
  };
}

function countWeekdaysUntil(date: Date) {
  let count = 0;
  const cursor = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));

  while (cursor <= date) {
    const day = cursor.getUTCDay();
    if (day !== 0 && day !== 6) {
      count += 1;
    }
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return count;
}

async function getUsersWithIncompleteLoe(today: Date) {
  const monthBounds = getMonthBounds(today);
  const workDaysElapsed = countWeekdaysUntil(today);
  const expectedHours = workDaysElapsed * 8;

  const { data, error } = await supabase.rpc('users_with_incomplete_loe', {
    p_month_start: monthBounds.start,
    p_month_end: monthBounds.end,
    p_expected_hours: expectedHours,
  });

  if (error) {
    throw error;
  }

  return {
    users: (data ?? []) as ReminderUser[],
    dueDateLabel: monthBounds.dueDateLabel,
  };
}

async function createReminderNotification(user: ReminderUser, dueDateLabel: string) {
  const sourceKey = `loe-reminder:${new Date().toISOString().slice(0, 10)}:${user.user_id}`;
  const title = `LoE submission deadline approaching`;
  const message = `You still have ${user.missing_days} incomplete work day(s) and ${user.missing_hours} hour(s) missing. Please update your log before ${dueDateLabel}, 23:59 UTC.`;

  const { error } = await supabase.from('notifications').upsert(
    {
      user_id: user.user_id,
      type: 'REMINDER',
      title,
      message,
      read: false,
      source_key: sourceKey,
      metadata: {
        event: 'loe_due_reminder',
        missing_days: user.missing_days,
        missing_hours: user.missing_hours,
      },
    },
    {
      onConflict: 'source_key',
      ignoreDuplicates: true,
    },
  );

  if (error) {
    throw error;
  }
}

Deno.serve(async () => {
  try {
    const today = new Date();
    const { users, dueDateLabel } = await getUsersWithIncompleteLoe(today);

    for (const user of users) {
      await createReminderNotification(user, dueDateLabel);
    }

    return Response.json({
      ok: true,
      remindersCreated: users.length,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
});
