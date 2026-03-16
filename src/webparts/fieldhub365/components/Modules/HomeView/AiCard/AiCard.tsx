import * as React from "react";
import { useEffect, useState } from "react";
import styles from "./AiCard.module.scss";
import { useNavigate } from "react-router-dom";
import { MessageCircleMore } from "lucide-react";

const queries = [
  "Show today's jobs",
  "Create a new work order",
  "Find customer details",
  "What jobs are delayed?",
  "Show technician schedule",
];

export default function AiCard() {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % queries.length);
    }, 2500);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className={styles.aiCard} onClick={() => navigate("/chatbot")}>
      <h3>Field 365 AI</h3>
      <div className={styles.content_wrapper}>
        {/* <div className={styles.icon}>🤖</div> */}
        <div>
          <img
            className={styles.ai_image}
            src={require("../../../../assets/Images/chatbot.gif")}
            alt=""
          />
        </div>
        <div className={styles.content}>
          <p>Smart Assistant for Field Teams</p>
          <div key={index} className={styles.carousel}>
            <MessageCircleMore size={11} />
            <span>{queries[index]}</span>
          </div>
        </div>
      </div>
      {/* <img
        className={styles.ai_image}
        src={require("../../../../assets/Images/chatbot.gif")}
        alt=""
      /> */}
    </div>
  );
}
