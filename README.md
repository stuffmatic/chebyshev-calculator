# Chebyshev approximation calculator

This is a web that generates code for efficiently approximating mathematical functions of one variable. This can for example be useful in resource constrained environments like embedded systems, where standard math functions are either not available or prohibitively expensive to evaluate.

Functions are approximated using so called Chebyshev expansions, which are numerically well behaved, can be evaluated very efficiently and converge quickly for smooth enough target functions. Chebyshev approximation theory is a deep mathematical topic, but evaluating a Chebyshev expansion in practice boils down to a simple code snippet. This goal of this project is to bridge the gap between theory and practice and bring Chebyshev approximation to a wider audience.

[![](screenshot.png)](https://stuffmatic.com/chebyshev)

Any javascript expression Stand-alone typescript code for compting and evaluating chebyshev approximations of you need more. If your needs are too big for the input field, see the `ChebyshevExpansion` class for a self contained bla with no dependencies.

## Usage

1. Enter the function you want to approximate as a valid Javascript expression of the variable `x`, for example `Math.cos(x)`.
2. Specify x min and x max
3. Change n terms until error is good
4. Export code

Pro tip: multiple intervals

## Building and running

The app is built with [React](https://react.dev/), [Typscript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/) and [Yarn](https://yarnpkg.com/). Run `yarn` to install dependencies, then `yarn dev` to start the dev server which serves the app on the URL displayed in the terminal. See [`package.json`](package.json) for other available commands.