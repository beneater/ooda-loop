import React from "react";
import {StyleSheet, css} from "aphrodite";

const styles = StyleSheet.create({
  segmentedControl: {
    border: "1px solid currentColor",
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
  },
});

class SegmentedControl extends React.Component {
  render() {
    return (
      <div
        className={css(styles.segmentedControl)}
        style={{color: this.props.color}}
      >
        {this.props.options.map((option, n) => (
          <label
            key={n}
            className={css(styles.label)}
            style={
              this.props.selected === n ? {
                background: this.props.color,
                color: "#000000",
              } : {}
            }
          >
            <input
              className={css(styles.input)}
              type="radio"
              value={n}
              checked={this.props.selected === n}
              onChange={() => this.props.onChange(n)}
            />
            {option}
          </label>
        ))}
      </div>
    );
  }
}

export default SegmentedControl;
