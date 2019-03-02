import React from "react";
import {StyleSheet, css} from "aphrodite";

const styles = StyleSheet.create({
  checkbox: {
    border: "1px solid #999999",
    fontWeight: "normal",
    borderRadius: 2,
    userSelect: "none",
  },
  input: {
    position: "absolute",
    opacity: 0,
  },
  label: {
    display: "inline-block",
    padding: "0 .71em",
    cursor: "pointer",
    lineHeight: "3em",
    color: "#999999",
  },
  selected: {
    background: "#999999",
    color: "#000000",
  },
});

const Toggle = (props) => (
  <div className={css(styles.checkbox)}>
    <label
      className={css(styles.label, props.checked && styles.selected)}
    >
      <input
        className={css(styles.input)}
        type="checkbox"
        checked={props.checked}
        onChange={props.onChange}
      />
      {props.caption}
    </label>
  </div>
);

export default Toggle;
