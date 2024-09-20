# Chebyshev approximation calculator

This is a web app with an intuitive visual interface that lets you generate code for efficiently approximating mathematical functions of one variable. This can for example be useful in resource constrained environments, like embedded systems, where standard math functions are either not available or prohibitively expensive to evaluate.

Functions are approximated using so called Chebyshev expansions, which are numerically well behaved and can be evaluated very efficiently. Chebyshev approximation theory is a deep mathematical topic, but evaluating a Chebyshev expansion in practice boils down to a simple code snippet. This goal of this project is to bridge the gap between theory and practice and bring Chebyshev approximation to a wider audience.

![](screenshot.png)

Any javascript expression Stand-alone typescript code for compting and evaluating chebyshev approximations of you need more.

## Usage

1. Enter the function you want to approximate as a valid Javascript expression of the variable `x`, for example `Math.cos(x)`.
2. Specify x min and x max
3. Change n terms until error is good
4. Export code

## Building and running