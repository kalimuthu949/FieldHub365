/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import * as React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import { TrendingUp, Award, Zap, Medal } from "lucide-react";
import styles from "./PerformanceView.module.scss";
import { useReveal } from "../HomeView/HomeView";
import { useEffect, useState } from "react";
import Loader from "../Loader/Loader";

export interface PerformanceStats {
  period: string;
  completed: number;
  rating: number;
}

const PerformanceView: React.FC = () => {
  const { ref, visible } = useReveal();

  const [isLoader, setIsLoader] = useState(false);

  const ratingData = [
    { name: "Excellent", value: 65, color: "#5B5FC7" },
    { name: "Good", value: 25, color: "#8a8886" },
    { name: "Average", value: 10, color: "#F5A623" },
  ];

  const WEEKLY_PERFORMANCE: PerformanceStats[] = [
    { period: "Mon", completed: 4, rating: 4.8 },
    { period: "Tue", completed: 6, rating: 4.9 },
    { period: "Wed", completed: 3, rating: 4.5 },
    { period: "Thu", completed: 7, rating: 5.0 },
    { period: "Fri", completed: 5, rating: 4.7 },
    { period: "Sat", completed: 2, rating: 4.8 },
    { period: "Sun", completed: 0, rating: 0 },
  ];

  useEffect(() => {
    setIsLoader(true);
    setInterval(() => {
      setIsLoader(false);
    }, 2000);
  }, []);

  return isLoader ? (
    <Loader />
  ) : (
    <div
      key={visible ? 1 : 0}
      ref={ref}
      className={`reveal ${visible ? "revealVisible" : ""} ${styles.performanceContainer}`}
    >
      <div className={styles.performanceHeader}>
        <h2>Performance Insights</h2>
        <p>Analytics driven by your service excellence</p>
      </div>

      {/* Hero Stats */}
      <div className={styles.heroCard}>
        <div>
          <p className={styles.heroLabel}>Weekly Efficiency</p>
          <h3 className={styles.heroValue}>94.8%</h3>
          <p className={styles.heroTrend}>
            <TrendingUp size={12} /> +4.2% from last week
          </p>
        </div>
        <div className={styles.heroIcon}>
          <Zap size={40} color="#fde047" fill="#fde047" />
        </div>
      </div>

      {/* Bar Chart */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h3>Completed Jobs</h3>
          <div className={styles.iconBox}>
            <Medal size={16} />
          </div>
        </div>

        <div className={styles.chartContainer}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={WEEKLY_PERFORMANCE as any}>
              <CartesianGrid vertical={false} stroke="#f1f1f1" />
              <XAxis
                dataKey="period"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#8a8886", fontSize: 11, fontWeight: 700 }}
              />
              <Tooltip />
              <Bar dataKey="completed" radius={[12, 12, 12, 12]} barSize={28}>
                {WEEKLY_PERFORMANCE.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.completed > 5 ? "#5B5FC7" : "#e1dfdd"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pie Chart */}
      <div className={styles.card}>
        <h3 className={styles.cusCardTitle}>Customer Sentiments</h3>

        <div className={styles.pieWrapper}>
          <div className={styles.pieChart}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={ratingData}
                  innerRadius={38}
                  outerRadius={52}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {
                    ratingData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    )) as unknown as React.ReactNode
                  }
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className={styles.legend}>
            {ratingData.map((item) => (
              <div key={item.name} className={styles.legendItem}>
                <div
                  className={styles.legendDot}
                  style={{ backgroundColor: item.color }}
                />
                <span>{item.name}</span>
                <strong>{item.value}%</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Achievement Card */}
      <div className={`${styles.card} ${styles.achievementCard}`}>
        <div className={styles.achievementHeader}>
          <div className={styles.achievementIcon}>
            <Award size={28} />
          </div>
          <div>
            <h3>Expert Level</h3>
            <p>Master Technician Track</p>
          </div>
        </div>

        <div className={styles.progressSection}>
          <div className={styles.progressLabel}>
            <span>Progression</span>
            <span className={styles.xp}>750 / 1000 XP</span>
          </div>

          <div className={styles.progressBar}>
            <div className={styles.progressFill} />
          </div>
        </div>

        <p className={styles.achievementText}>
          You're in the <span>top 5%</span> of technicians this month. Keep it
          up!
        </p>
      </div>
    </div>
  );
};

export default PerformanceView;
