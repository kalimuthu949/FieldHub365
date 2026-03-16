import * as React from "react";
import styles from "./Loader.module.scss";

const Loader = () => {
  return (
    <div className={styles.loaderContainer}>
      <img
        src={require("../../../assets/Images/repair.gif")}
        alt="Loading..."
        className={styles.loaderGif}
      />
    </div>
  );
};

export default Loader;
