import { useState, useEffect } from "react";

export type TimeOfDay = "morning" | "day" | "evening" | "night";

function getTimeOfDay(): TimeOfDay {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 11) return "morning";
    if (hour >= 11 && hour < 16) return "day";
    if (hour >= 16 && hour < 19) return "evening";
    return "night";
}

export function useTimeOfDay() {
    const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>(() => getTimeOfDay());

    useEffect(() => {
        setTimeOfDay(getTimeOfDay());
        const interval = setInterval(() => {
            setTimeOfDay(getTimeOfDay());
        }, 60000); // 1分ごとにチェック

        return () => clearInterval(interval);
    }, []);

    return timeOfDay;
}
