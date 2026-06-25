import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { format, parseISO, startOfMonth, endOfMonth } from "date-fns";
import { PlusCircle } from "lucide-react";

export default function CalendarView({ date, nutrition }) {
  const initialMonth = parseISO(`${date}T00:00:00`);
  const range = {
    start: format(startOfMonth(initialMonth), "yyyy-MM-dd"),
    end: format(endOfMonth(initialMonth), "yyyy-MM-dd"),
  };
  const meals = nutrition?.meals || [];
  const events = meals.map((meal) => ({
    title: `${meal.type}: ${meal.description}`,
    date,
  }));

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Big Calendar</h2>
          <p className="text-sm text-slate-400">Für den gewählten Tag werden echte Meal-Logs als Events gespiegelt.</p>
        </div>
        <PlusCircle className="h-5 w-5 text-orange-300" />
      </div>
      <div className="mb-4 rounded-2xl border border-white/10 bg-slate-950/50 p-4 text-sm text-slate-300">
        Monat: {range.start} bis {range.end}
      </div>
      <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-3">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          initialDate={date}
          height="auto"
          events={events}
          headerToolbar={{ left: "prev,next today", center: "title", right: "dayGridMonth,timeGridWeek" }}
        />
      </div>
    </section>
  );
}
