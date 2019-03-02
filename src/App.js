import React from "react";
import {StyleSheet, css} from "aphrodite";

import SegmentedControl from "./SegmentedControl.js";
import Toggle from "./Toggle.js";
import {F4, Mig21} from "./Planes.js";

const BLUE = "#558cf4";
const RED = "#c13c3d";

const styles = StyleSheet.create({
  app: {
    backgroundColor: "#282c34",
    position: "relative",
    fontFamily: "sans-serif",
    overflow: "hidden",
  },
  controls: {
    position: "absolute",
    bottom: 0,
    left: 0,
    display: "flex",
    justifyContent: "center",
  },
  control: {
    textAlign: "center",
    color: "#ffffff",
    fontWeight: "bold",
    lineHeight: 2,
    paddingLeft: "3em",
    paddingRight: "3em",
  },
});

const OodaOptions = [250, 1000, 2000, 5000];

// State data for the simulation. Not using React state since there's no need
// to re-render when any of this changes.
const data = {
  offsetX: 0,
  offsetY: 0,
  f4: {
    x: Math.random() * 80 + 10,
    y: Math.random() * 80 + 10,
    heading: Math.round(Math.random() * 360),
    assignedHeading: 0,
    speed: 0.3,
    turnRate: 0,
    history: [],
  },
  mig: {
    x: Math.random() * 80 + 10,
    y: Math.random() * 80 + 10,
    heading: Math.round(Math.random() * 360),
    assignedHeading: 0,
    speed: 0.3,
    turnRate: 0,
    history: [],
  },
};

// Convenience functions so we can use degrees everywhere
const sin = (a) => Math.sin(a * (Math.PI / 180));
const cos = (a) => Math.cos(a * (Math.PI / 180));
const atan2 = (y, x) => Math.atan2(y, x) * (180 / Math.PI);

// Return difference in degrees between a1 and a2.
// Result is negative if you need to turn left to get from a1 to a2, positive
// if you need to turn right
const angleDiff = (angle1, angle2) => {
  let diff = angle2 - angle1;
  while (diff < -180) diff += 360;
  while (diff > 180) diff -= 360;
  return diff;
};

// Adapted from
// https://stackoverflow.com/questions/808826/draw-arrow-on-canvas-tag
function canvasArrow(context, fromx, fromy, tox, toy) {
  var headlen = 10; // length of head in pixels
  var angle = Math.atan2(toy - fromy, tox - fromx);
  context.moveTo(fromx, fromy);
  context.lineTo(tox, toy);
  context.moveTo(
    tox - headlen * Math.cos(angle - Math.PI / 6),
    toy - headlen * Math.sin(angle - Math.PI / 6),
  );
  context.lineTo(tox, toy);
  context.lineTo(
    tox - headlen * Math.cos(angle + Math.PI / 6),
    toy - headlen * Math.sin(angle + Math.PI / 6),
  );
  context.lineTo(
    tox - headlen * Math.cos(angle - Math.PI / 6),
    toy - headlen * Math.sin(angle - Math.PI / 6),
  );
  context.lineTo(tox, toy);
}

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      width: 0,
      height: 0,
      fontSize: 16,
      f4Ooda: OodaOptions[OodaOptions.length - 1],
      migOoda: OodaOptions[0],
      showHistory: false,
    };

    this.raf = window.requestAnimationFrame(this.animationLoop);
    this.migTimer = window.setTimeout(this.updateMig, this.state.migOoda);
    this.f4Timer = window.setTimeout(this.updateF4, this.state.f4Ooda);
  }

  componentDidMount() {
    window.addEventListener("resize", this._onWindowResize, false);
    setTimeout(this._onWindowResize, 0);
  }

  _onWindowResize = () => {
    const w = Math.max(
      document.documentElement.clientWidth,
      window.innerWidth || 0,
    );
    const h = Math.max(
      document.documentElement.clientHeight,
      window.innerHeight || 0,
    );
    this.setState({
      width: Math.min(w, (h * 1920) / 1080),
      height: Math.min(h, (w * 1080) / 1920),
      fontSize: Math.min(h, (w * 1080) / 1920) / 45,
    });
  };

  // Update the MiG's assigned heading.
  updateMig = () => {
    data.mig.assignedHeading = Math.round(
      (atan2(data.f4.y - data.mig.y, data.f4.x - data.mig.x) + 360) % 360,
    );
    this.migTimer = window.setTimeout(this.updateMig, this.state.migOoda);
  };

  // Update the F-4's assigned heading.
  updateF4 = () => {
    data.f4.assignedHeading = Math.round(
      (atan2(data.mig.y - data.f4.y, data.mig.x - data.f4.x) + 360) % 360,
    );
    this.f4Timer = window.setTimeout(this.updateF4, this.state.f4Ooda);
  };

  animationLoop = () => {
    if (!this.ctx) {
      return;
    }
    const {width, height} = this.state;

    data.f4.turnRate = Math.sign(
      angleDiff(data.f4.heading, data.f4.assignedHeading),
    );
    data.mig.turnRate = Math.sign(
      angleDiff(data.mig.heading, data.mig.assignedHeading),
    );

    // Update the scroll offsets to try to keep both planes visible
    data.offsetX = Math.max(
      Math.max(data.f4.x, data.mig.x) - 90,
      Math.min(Math.min(data.f4.x, data.mig.x) - 10, data.offsetX),
    );
    data.offsetY = Math.max(
      Math.max(data.f4.y, data.mig.y) - 80,
      Math.min(Math.min(data.f4.y, data.mig.y) - 20, data.offsetY),
    );

    // Update the positions based on heading and speed
    data.f4.x += cos(data.f4.heading) * data.f4.speed;
    data.f4.y += sin(data.f4.heading) * data.f4.speed;
    data.mig.x += cos(data.mig.heading) * data.mig.speed;
    data.mig.y += sin(data.mig.heading) * data.mig.speed;

    // Track path history
    if (this.state.showHistory) {
      data.f4.history.push([data.f4.x, data.f4.y]);
      data.mig.history.push([data.mig.x, data.mig.y]);
      data.f4.history = data.f4.history.slice(-1000);
      data.mig.history = data.mig.history.slice(-1000);
    }

    // Update the headings based on turn rates
    data.f4.heading = Math.round(
      (data.f4.heading + data.f4.turnRate + 360) % 360,
    );
    data.mig.heading = Math.round(
      (data.mig.heading + data.mig.turnRate + 360) % 360,
    );

    // Redraw everything
    this.ctx.clearRect(0, 0, width, height);

    // Draw gridlines
    this.ctx.strokeStyle = "#ffffff1a";
    this.ctx.lineWidth = 1;

    const xShift = ((data.offsetX / 100) * width) % (width / 20);
    const yShift = ((data.offsetY / 100) * height) % (height / 20);

    Array(21)
      .fill()
      .forEach((_, i) => {
        this.ctx.beginPath();
        this.ctx.moveTo((width / 20) * i - xShift, 0);
        this.ctx.lineTo((width / 20) * i - xShift, height);
        this.ctx.stroke();
      });

    Array(21)
      .fill()
      .forEach((_, i) => {
        this.ctx.beginPath();
        this.ctx.moveTo(0, (height / 20) * i - yShift);
        this.ctx.lineTo(width, (height / 20) * i - yShift);
        this.ctx.stroke();
      });

    // Draw the F-4's vector
    this.ctx.strokeStyle = BLUE + "66";
    this.ctx.fillStyle = BLUE + "66";
    this.ctx.lineWidth = 3;

    this.ctx.beginPath();
    canvasArrow(
      this.ctx,
      ((data.f4.x - data.offsetX) * width) / 100,
      ((data.f4.y - data.offsetY) * height) / 100,
      ((data.f4.x - data.offsetX + cos(data.f4.assignedHeading) * 5) * width) /
        100,
      ((data.f4.y - data.offsetY + sin(data.f4.assignedHeading) * 5) * height) /
        100,
    );
    this.ctx.fill();
    this.ctx.stroke();

    // Draw the MiG's vector
    this.ctx.strokeStyle = RED + "66";
    this.ctx.fillStyle = RED + "66";
    this.ctx.lineWidth = 3;

    this.ctx.beginPath();
    canvasArrow(
      this.ctx,
      ((data.mig.x - data.offsetX) * width) / 100,
      ((data.mig.y - data.offsetY) * height) / 100,
      ((data.mig.x - data.offsetX + cos(data.mig.assignedHeading) * 5) *
        width) /
        100,
      ((data.mig.y - data.offsetY + sin(data.mig.assignedHeading) * 5) *
        height) /
        100,
    );
    this.ctx.fill();
    this.ctx.stroke();

    if (this.state.showHistory) {
      // F-4 History
      this.ctx.strokeStyle = BLUE + "66";
      this.ctx.fillStyle = BLUE + "66";
      this.ctx.lineWidth = 2;

      this.ctx.beginPath();
      this.ctx.moveTo(
        ((data.f4.history[0][0] - data.offsetX) * width) / 100,
        ((data.f4.history[0][1] - data.offsetY) * height) / 100,
      );
      data.f4.history.forEach((history) => {
        this.ctx.lineTo(
          ((history[0] - data.offsetX) * width) / 100,
          ((history[1] - data.offsetY) * height) / 100,
        );
      });
      this.ctx.stroke();

      // MiG History
      this.ctx.strokeStyle = RED + "66";
      this.ctx.fillStyle = RED + "66";
      this.ctx.lineWidth = 2;

      this.ctx.beginPath();
      this.ctx.moveTo(
        ((data.mig.history[0][0] - data.offsetX) * width) / 100,
        ((data.mig.history[0][1] - data.offsetY) * height) / 100,
      );
      data.mig.history.forEach((history) => {
        this.ctx.lineTo(
          ((history[0] - data.offsetX) * width) / 100,
          ((history[1] - data.offsetY) * height) / 100,
        );
      });
      this.ctx.stroke();
    }

    // Update the position and angle of the planes
    // This hackily changes the SVGs' positions and transforms. Rerendering the
    // entire component would more cleanly achieve the same thing, but with
    // significant performance overhead.
    if (this.f4svg) {
      const displayAngle = atan2(
        sin(data.f4.heading) * height,
        cos(data.f4.heading) * width,
      );
      this.f4svg.style.left = data.f4.x - data.offsetX + "%";
      this.f4svg.style.top = data.f4.y - data.offsetY + "%";
      this.f4svg.children[0].setAttribute(
        "transform",
        `rotate(${displayAngle + 180}, 625.05, 392.8)`,
      );
    }
    if (this.migsvg) {
      const displayAngle = atan2(
        sin(data.mig.heading) * height,
        cos(data.mig.heading) * width,
      );
      this.migsvg.style.left = data.mig.x - data.offsetX + "%";
      this.migsvg.style.top = data.mig.y - data.offsetY + "%";
      this.migsvg.children[0].setAttribute(
        "transform",
        `rotate(${displayAngle + 180}, 598.2, 286.9)`,
      );
    }

    // Queue up to redraw the next frame
    this.raf = window.requestAnimationFrame(this.animationLoop);
  };

  changeF4Ooda = (option) => {
    const oodaTime = OodaOptions[option];

    this.setState({
      f4Ooda: oodaTime,
    });

    window.clearTimeout(this.f4Timer);
    this.f4Timer = window.setTimeout(this.updateF4, oodaTime);
  };

  changeMigOoda = (option) => {
    const oodaTime = OodaOptions[option];

    this.setState({
      migOoda: oodaTime,
    });
    window.clearTimeout(this.migTimer);
    this.migTimer = window.setTimeout(this.updateMig, oodaTime);
  };

  render() {
    const {height, width} = this.state;
    return (
      <div className={css(styles.app)} style={{width: width, height: height}}>
        <canvas
          width={width}
          height={height}
          ref={(canvas) => {
            this.ctx = canvas && canvas.getContext("2d");
          }}
        />
        <F4
          ref={(f4) => (this.f4svg = f4)}
          size={1}
          x={data.f4.x - data.offsetX}
          y={data.f4.y - data.offsetY}
          heading={atan2(
            sin(data.f4.heading) * height,
            cos(data.f4.heading) * width,
          )}
        />
        <Mig21
          ref={(mig) => (this.migsvg = mig)}
          size={1}
          x={data.mig.x - data.offsetX}
          y={data.mig.y - data.offsetY}
          heading={atan2(
            sin(data.mig.heading) * height,
            cos(data.mig.heading) * width,
          )}
        />
        <div
          className={css(styles.controls)}
          style={{
            width: width,
            height: width * 0.08,
            fontSize: this.state.fontSize,
          }}
        >
          <div className={css(styles.control)}>
            <div style={{color: BLUE}}>F-4 OODA loop time</div>
            <SegmentedControl
              color={BLUE}
              options={OodaOptions.map((opt) => opt + "ms")}
              selected={OodaOptions.indexOf(this.state.f4Ooda)}
              onChange={this.changeF4Ooda}
            />
          </div>
          <div className={css(styles.control)}>
            <div>&nbsp;</div>
            <Toggle
              checked={this.state.showHistory}
              onChange={() => {
                this.setState({showHistory: !this.state.showHistory});
                data.f4.history = [];
                data.mig.history = [];
              }}
              caption="Trace paths"
            />
          </div>
          <div className={css(styles.control)}>
            <div style={{color: RED}}>MiG-21 OODA loop time</div>
            <SegmentedControl
              color={RED}
              options={OodaOptions.map((opt) => opt + "ms")}
              selected={OodaOptions.indexOf(this.state.migOoda)}
              onChange={this.changeMigOoda}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default App;
