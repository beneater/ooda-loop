# OODA loop demonstration

Copyright 2019 Ben Eater

This code is [MIT licensed](http://en.wikipedia.org/wiki/MIT_License).

## What is this?

This is a simple demonstration of an "observe, orient, decide, act (OODA) loop"
that I built for Destin to use in this Smarter Every Day video:

[<img src=https://img.youtube.com/vi/MUiYglgGbos/maxresdefault.jpg width=360/>](https://www.youtube.com/watch?v=MUiYglgGbos)

This simulation is running on [my website](https://eater.net/ooda-loop) if you’d
like to check it out.

## What does the simulation show?

It’s an extremely simple model… Each plane has the singular goal of flying
towards the other plane. That’s it. The only difference between the planes is
the OODA interval, otherwise everything else—speed, turn rate, etc—is the same.

Each interval, the plane will determine the bearing direct to the other plane.
That bearing then becomes its assigned heading (shown by the vector) until the
next interval. Meanwhile it always blindly turns towards and flies its assigned
heading.

The planes start in random positions, but the simplicity of the algorithm means
they quickly fall into predictable patterns. But if the difference in OODA loop
times is significant between the two planes, the pattern it falls into results
in one of them “winning”—that is, maintaining a better tactical position.

## Technical

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).
Not because React is a good choice for building something game-like—it's not—but
because it was a quick-and-easy way to set up a reasonably-configured build
environment. Consequently, I wouldn't recommend using this project as an
example of how to use React, or how to write a game. Or if you do, at least be
aware that there are two separate design patterns inelegantly woven together
here.

### Available scripts

In the project directory, you can run:

#### `yarn start`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

#### `yarn build`

Builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.
