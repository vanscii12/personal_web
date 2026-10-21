export const metadata = {
  id: 'spacetime-geometry',
  title: "Spacetime and Geometry Notes",
  category: 'Physics',
  description: "",
  tags: ['Physics', 'Relativity'],
  date: '2026'
}

export const content = `
PHYS 136 Notes
## Special Relativity and Flat Spacetime

Spacetime is a four-dimensional set, with elements labeled by three dimensions of space and one of time.  The particles are allowed to move back and forth in space but only forward in time.

Consider the coordiantes $(t,x,y,z)$ on spacetime, the spatial part, $(x,y,z)$, stays unchanged. But with the additional time component, the interval between two points becomes
\\begin{equation}
    \\boxed{(\\Delta s)^2 = -(c\\Delta t)^2 + (\\Delta x)^2 + (\\Delta y)^2 + (\\Delta z)^2}
    \\label{eq:1-1}
\\end{equation}
Instead of using $(t,x,y,z)$, we can defined
\\begin{equation}
    x^\\mu = (x^0, x^1, x^2, x^3) = (ct,x,y,z)
\\end{equation}
Furthermore, for simplicity, using the unit system where
\\begin{equation}
    c = 1
\\end{equation}
It is also useful to define a $4\\times4$ matrix
\\begin{equation}
    \\eta_{\\mu\\nu} = \\begin{pmatrix}
        -1 & 0 & 0 & 0\\\\
        0 & 1 & 0 & 0\\\\
        0 & 0 & 1 & 0\\\\
        0 & 0 & 0 & 1\\\\
    \\end{pmatrix}
\\end{equation}
Called this metric. Using two definitions above, Eq. $\\ref{eq:1-1}$ can be compressed into
\\begin{equation}
    (\\Delta s)^2 = \\eta_{\\mu\\nu}\\Delta x^\\mu \\Delta x^\\nu
    \\label{eq:1-2}
\\end{equation}

In spacetime diagram, Eq. $\\ref{eq:1-2}$ represents the sepeartion between two points. There are three cases where $(\\Delta s)^2$ can be i. $>0$; ii. $=0$; and iii. $<0$. These three condition are called spacelike, lightlike/null, and timelike sepeartion respetively.
Note that only timelike sepeartion are possible since it is within the light cone while spacelike seperation are outside the lightcone and null seperation is along the light cone.

The proper time between two events measures the time elapsed as seen by an observer moving on a straight path between the events. And we can define the proper time to be
\\begin{equation}
    (\\Delta \\tau)^2 = -(\\Delta s)^2 = -\\eta_{\\mu\\nu}\\Delta x^\\mu \\Delta x^\\nu
\\end{equation}

Moving to infinitesimal condition, the line element is
\\begin{equation}
    ds^2 = \\eta_{\\mu\\nu} dx^\\mu dx^\\nu
\\end{equation}
With the definiton, the distance is given by
\\begin{equation}
    \\Delta s = \\int\\sqrt{\\eta_{\\mu\\nu} dx^\\mu dx^\\nu}
\\end{equation}
However, it is helpful to express in a parametrized curve, $x^\\nu(\\lambda)$, so that
\\begin{equation}
    \\Delta s = \\int \\sqrt{\\eta_{\\mu\\nu} \\frac{dx^\\mu}{d\\lambda}\\frac{dx^\\nu}{d\\lambda}} d\\lambda
\\end{equation}

### Lorentz Transformations

One simple transformation is translation, which simply shift the coordiantes
\\begin{equation}
    x^{\\mu} \\rightarrow x^{\\mu'} = \\delta_\\mu^{\\mu'} (x^\\mu + a^\\nu)
\\end{equation}
where $a^\\mu$ is a set of four fixed number and
\\begin{equation}
    \\delta_\\mu^{\\mu'} = \\left\\{
        \\begin{aligned}
            1 \\quad \\text{when} \\mu'=\\mu,\\\\
            0 \\quad \\text{when} \\mu'\\ne\\mu.
        \\end{aligned}
        \\right.
\\end{equation}

Other transformations, such as rotation and boosts, are linear transformations, described by multiplying $x^\\mu$ by a matrix
\\begin{equation}
    x^{\\mu'} = \\Lambda^{\\mu'}_{\\quad\\nu} x^\\nu
\\end{equation}
or matrix notation
\\begin{equation}
    x'=\\Lambda x
\\end{equation}
This kind of transformation will not leave $\\Delta x$ unchanged but multplying the result by $\\Lambda$. However, start with the matrix notation of the transformation
\\begin{equation}
    \\begin{aligned}
        (\\Delta s)^2 = (\\Delta x)^{\\text{T}} \\eta (\\Delta x) &= (\\Delta x')^{\\text{T}} \\eta (\\Delta x')\\\\
        &= (\\Delta x)^{\\text{T}} \\Lambda^{\\text{T}} \\eta \\Lambda (\\Delta x)
    \\end{aligned}
\\end{equation}
and therefore
\\begin{equation}
    \\eta = \\Lambda^{\\text{T}} \\eta \\Lambda
\\end{equation}
in matrix notation, or in index notation
\\begin{equation}
    \\eta_{\\rho\\sigma} = \\Lambda^{\\mu'}_{\\quad \\rho} \\eta_{\\mu'\\rho'}\\Lambda^{\\nu'}_{\\quad \\sigma} = \\Lambda^{\\mu'}_\\rho \\Lambda^{\\nu'}_\\rho \\eta_{\\mu'\\nu'}
\\end{equation}
The matrices that satisfy above equation are known as Lorentz Transformations; the set of them forms a group under matrix multiplication, known as the Lorentz group.

One example of simple Lorentz transformation is the rotation in $x-y$ plane
\\begin{equation}
    \\Lambda^{\\mu'}_{\\quad\\nu} = \\begin{pmatrix}
        1 & 0 & 0 & 0\\\\
        0 & \\cos\\theta & \\sin\\theta & 0\\\\
        0 & -\\sin\\theta & \\cos\\theta & 0\\\\
        0 & 0 & 0 & 1
    \\end{pmatrix}
\\end{equation}
and the boost in the $x$-direction
\\begin{equation}
    \\Lambda^{\\mu'}_{\\quad\\nu} = \\begin{pmatrix}
        \\cosh\\phi & -\\sinh\\phi & 0 & 0\\\\
        -\\sinh\\phi & \\cosh\\phi & 0 & 0\\\\
        0 & 0 & 1 & 0\\\\
        0 & 0 & 0 & 1
    \\end{pmatrix}
    \\label{eq:1-3}
\\end{equation}
From transformation given by Eq. $\\ref{eq:1-3}$,
\\begin{equation}
    \\begin{aligned}
        t' &= t\\cosh\\phi - x\\sinh\\phi\\\\
        x' &= -t\\sinh\\phi + x\\cosh\\phi
    \\end{aligned}
\\end{equation}
This suggestsa point defined at $x'=0$ is moving at velocity
\\begin{equation}
    v = \\frac{x}{t} = \\frac{\\sinh\\phi}{\\cosh\\phi} = \\tanh\\phi
\\end{equation}
Replace $\\phi = \\tanh^{-1}v$
\\begin{equation}
    \\begin{aligned}
        t' &= \\gamma(t-vx)\\\\
        x' &= \\gamma(x-vt)
    \\end{aligned}
\\end{equation}
where $\\gamma = 1/\\sqrt{1-v^2}$

### Dual Vectors (One-Forms)

The dual space is the space of all linear maps from the original vector space tro the real numbers, and is often denoted by an asterisk. For example, the dual space of the tangent space $T_p$ is $T_p^*$, cotangent space. In math lingo, if $\\omega\\in T_p^*$ is a dual vector, then it acts as a map such that
\\begin{equation}
    \\omega(aV+bW)=a\\omega(V)+b\\omega(W)\\in \\mathbb{R}
\\end{equation}
where $V, W$ are vectors and $a, b$ are real numbers.

Define a set of basis dual vectors $\\hat\\theta^{(\\nu)}$ such that
\\begin{equation}
    \\hat\\theta^{(\\nu)}(\\hat e_{\\mu})=\\delta_\\mu^\\nu
    \\label{eq:1-2-1}
\\end{equation}
Therefore, the dual vector can be written as
\\begin{equation}
    \\omega=\\omega_\\mu \\hat\\theta^{(\\mu)}
\\end{equation}
Apply a dual vector on a vector
\\begin{equation}
    \\begin{aligned}
        \\omega(V)&=\\omega_\\mu \\hat\\theta^{(\\mu)}\\qty(V^\\nu \\hat e_{\\nu})\\\\
        &=\\omega_\\mu V^\\nu \\hat\\theta^{(\\mu)}\\hat e_{\\nu}\\\\
        &=\\omega_\\mu V^\\nu \\delta_\\nu^\\mu\\\\
        &=\\omega_\\mu V^\\mu \\in \\mathbb{R}
    \\end{aligned}
\\end{equation}

However, in spacetime, it is no longer a single vector space, but fields of vectors and dual vectors. In this case, the action of a dual vector field on a vector field is a **scaler** (function) on spacetime, which is invariant under Lorentz transformations. The transformation of dual vectors is similar to that for vectors
\\begin{equation}
    \\omega_{\\mu'} = \\Lambda^\\nu \\!_{\\mu'}\\omega_\\nu
\\end{equation}
and the basis
\\begin{equation}
    \\hat\\theta^{(\\rho')}=\\Lambda^{\\rho'} \\!_\\sigma\\hat\\sigma^{(\\sigma)}
\\end{equation}
For example, the gradient of a scalar function is a dual vector, and is denoted as $\\dd$
\\begin{equation}
    \\dd \\phi=\\pdv{\\phi}{x^\\mu}\\hat\\theta^{(\\mu)}
\\end{equation}
Under transformation
\\begin{equation}
    \\begin{aligned}
        \\pdv{\\phi}{x^{\\mu'}} &=\\pdv{x^\\mu}{x^{\\mu'}}\\pdv{\\phi}{x^\\mu}\\\\
        &=\\Lambda^\\mu \\!_{\\mu'}\\pdv{\\phi}{x^\\mu}
    \\end{aligned}
\\end{equation}
where $x^\\mu = \\Lambda^\\mu \\!_{\\mu'}x^{\\mu'}$. Therefore, we see that the partial derivative satisfies the transformation rule. It is often denoted the partical derivatives as
\\begin{equation}
    \\pdv{\\phi}{x^\\mu}=\\partial_\\mu\\phi
\\end{equation}

At last, the vectors that we used to called, such as $T_p$, are refered to as **contravariant vectors**, and the dual vecotrs are referred as **covariant vectors**.

## Manifolds

### Gravity as Geometry

**Weak Equivalence Principle**, or WEP, states that the inertial mass and gravitational mass of any object are equal. The inertial mass $m_i$ is defined as
\\begin{equation}
    **F** = m_i **a**
\\end{equation}
and the gravitational mass $m_g$ is defined as
\\begin{equation}
    **F**_g = -m_g \\nabla\\Phi
\\end{equation}

### Manifolds

In a simple way, manifold is a space that may be curved and have a complicated topology, but in local regions looks just like $\\mathbb{R}^n$. The entire manifold is smoothly sewned together with those local regional flat spaces. Some examples of manifolds includes

- $\\mathbb{R}^n$ itself. In this case, $\\mathbb{R}^n$ looks like $\\mathbb{R}^n$ not only locally but also globally
- The $n$-sphere, $S^n$, where all points have the same distance to the origin in $\\mathbb{R}^{n+1}$. Circle is a $S^1$ sphere.
- The $n$-torus, $T^n$. Doughnut.
- Riemann surface of genus $g$.
- Direct product of two manifolds.

On the other hand, what is not a manifold. For example, a cone, which has local region looks like $\\mathbb{R}^n$ everywhere except the vertex.

Back to the simple definition, in order to formalize the notion of “looking locally like $\\mathbb{R}^n$" and “smoothly sewn together", we need some definitions.

- **Map**: Given two sets $M$ and $N$, a map $\\phi: M \\rightarrow N$ is a relationship that assigns each element of $M$ to exactly one element of $N$.
- **Composition**: Given two maps $\\phi: A\\rightarrow B$ and $\\psi: B\\rightarrow C$, the composition of $\\phi$ and $\\psi$ is $\\psi \\circ \\phi : A\\rightarrow C$, or $\\qty(\\psi \\circ\\phi)(a)=\\psi(\\phi(a))$
- **One-to-one (Injective)**: : Each lement of $N$ has at most one element of $M$ mapped into it.
- **Onto (Surjective)**: Each element of $N$ has at least one element of $M$ mapped into it.

Now given a map $\\phi: M\\rightarrow N$, we have the following definitions

- **Domian**: The set $M$ is the domain of the map $\\phi$.
- **Image**: The set $N$ is the image of the map $\\phi$.
- **Preimage**: For any subset $U \\in N$,

### Vectors Again

Define $\\mathcal{F}$ to be the space of all smooth functions on $M$. At point $p$, the operator, directional derivative, which maps $f\\rightarrow df/d\\lambda$, can be defined by curves through $p$. Therefore, *the tangent space $T_p$ can be identified with the space of directional derivative operators along curves throught $p$.* That is, we have directional derivative operators \${d/d\\lambda, d/d\\eta, \\dots}$ that forms the $T_p$.

To make this idea valid, we should show that: 1. the space of directional derivatives is a vector space; and 2. it is the vector space we want, that has the same dimensionality as $M$, yilds a natural idea of a vector pointing along a certain directions, and so on.

For the first point, suppose we have two operators $d/d\\lambda$ and $d/d\\eta$ representing derivatives along two curves $x^\\mu(\\lambda)$ and $x^\\mu(\\eta)$ through $p$. We can write a new operator $d/d\\gamma$ as the lienar combination of these two,
\\begin{equation}
    \\frac{d}{d\\gamma} = a\\qty(\\frac{d}{d\\lambda})+b\\qty(\\frac{d}{d\\eta})
\\end{equation}
Applying chain rule
\\begin{equation}
    \\begin{aligned}
        \\qty(a\\frac{d}{d\\lambda}+b\\frac{d}{d\\eta})(fg)&=af\\frac{dg}{d\\lambda}+ag\\frac{df}{d\\lambda}+bf\\frac{dg}{d\\eta}+bg\\frac{df}{d\\eta}\\\\
        &=\\qty(a\\frac{df}{d\\lambda}+b\\frac{df}{d\\eta})g + \\qty(a\\frac{dg}{d\\lambda}+b\\frac{dg}{d\\eta})f
    \\end{aligned}
\\end{equation}

![Decomposition of the scenario.](img/1.png)

Therefore, we can see the operators are linear. For the second point, consider we have a coordiante chart with cooridnates $x^\\mu$, then there is a set of directional derivative, $\\partial_\\mu$, at $p$ with dimension of $n$. Now consider an $n$-manifold $M$, a coordiante chart$\\phi:M\\rightarrow \\mathbb{R}^n$, a curve $\\gamma: \\mathbb{R}\\rightarrow M$, and a function $f:M\\rightarrow\\mathbb{R}$ (as shown in Fig.$\\ref{fig:2-1}$). We can write
\\begin{equation}
    \\begin{aligned}
        \\frac{d}{d\\lambda}f &= \\frac{d}{d\\lambda}(f\\circ \\gamma)\\\\
        &= \\frac{d}{d\\lambda}[(f\\circ \\phi^{-1})\\circ(\\phi\\circ\\gamma)]\\\\
        &= \\frac{d (\\phi\\circ\\gamma)^\\mu}{d\\lambda}\\frac{\\partial(f\\circ\\phi^{-1})}{\\partial x^\\mu}\\\\
        &= \\frac{dx^\\mu}{d\\lambda}\\partial_\\mu f
    \\end{aligned}
\\end{equation}
Since $f$ is an arbitrary function, we can say
\\begin{equation}
    \\frac{d}{d\\lambda}=\\frac{d x^\\mu}{d\\lambda}\\partial_\\mu
\\end{equation}
so that $\\hat e(\\mu)=\\partial_\\mu$ is the basis, and is called $**coordinate basis**$ for $T_p$. There are several properties of coordiante basis

- The coordiante bases vectors are typically not normalized to unity, nor orthogonal to each other.
- On a curved manifold, a coordiante basis will never be orthonormal throughout a neighborhood of any point where the curvature does not vanish.

The tranformation law under changes of coordinates is immediate with coordinate basis. The basis vector will transforms as
\\begin{equation}
    \\partial_{\\mu'}=\\pdv{x^\\mu}{x^{\\mu'}}\\partial_\\mu
\\end{equation}
and so does the vectors
\\begin{equation}
    \\begin{aligned}
        V^\\mu\\partial_\\mu &= V^{\\mu'}\\partial_{\\mu'}\\\\
        &= V^{\\mu'}\\pdv{x^\\mu}{x^{\\mu'}}\\partial_\\mu\\\\
        V^{\\mu'} &= \\pdv{x^{\\mu'}}{x^\\mu}V^\\mu
    \\end{aligned}
\\end{equation}

### Tensors Again

From the dual vectors, we say that one example of a one-form is the gradient of a function $f$, denoted as $\\dd f$. Its action on a vector $d/d\\lambda$ si the directional derivative of the function
\\begin{equation}
    \\dd f\\qty(\\frac{d}{d\\lambda})=\\frac{df}{d\\lambda}
\\end{equation}

Following the same idea as ($\\ref{eq:1-2-1}$), we can find that
\\begin{equation}
    \\dd x^\\mu(\\partial_\\nu)=\\pdv{x^\\mu}{x^\\nu}=\\delta_\\nu^\\mu
\\end{equation}
Therefore, the gradients $\\{\\dd x^\\mu\\}$ are a set of basis one-forms. And
\\begin{equation}
    \\omega=\\omega_\\mu \\dd x^\\mu
\\end{equation}
The transformation properties are similar to those for vectors, with
\\begin{equation}
    \\dd x^\\mu=\\pdv{x^{\\mu'}}{x^\\mu}\\dd x^\\mu
\\end{equation}
for basis one-forms, and
\\begin{equation}
    \\omega_{\\mu'}=\\pdv{x^\\mu}{x^{\\mu'}}\\omega_\\mu
\\end{equation}
for components.

A $(k,l)$ tensor is a multilinear map from a collection of $k$ dual vectors adn $l$ vectors to $\\mathbb{R}$. That is
\\begin{equation}
    T=T^{\\mu_1\\cdots\\mu_k} \\!_{\\nu_1\\cdots\\nu_l}\\partial_{\\mu_1}\\otimes\\cdots\\otimes\\partial_{\\mu_k}\\otimes\\dd x^{\\nu_1}\\otimes\\cdots\\otimes\\dd x^{\\nu_l}
\\end{equation}
or equivalently, the components are
\\begin{equation}
    T^{\\mu_1\\cdots\\mu_k} \\!_{\\nu_1\\cdots\\nu_l}=T\\qty(\\dd x^{\\mu_1},\\dots,\\dd x^{\\mu_k},\\partial_{\\nu_1},\\dots,\\partial_{\\nu_l})
\\end{equation}
The transformation law will also be straightforward
\\begin{equation}
    T^{\\mu_1'\\cdots\\mu_k'} \\!_{\\nu_1'\\cdots\\nu_l'}=\\pdv{x^{\\mu_1'}}{x^{\\mu_1}}\\cdots \\pdv{x^{\\mu_k'}}{x^{\\mu_k}}\\pdv{x^{\\nu_1}}{x^{\\nu_1'}}\\cdots\\pdv{x^{\\nu_l}}{x^{\\nu_l'}}T^{\\mu_1\\cdots\\mu_k} \\!_{\\nu_1\\cdots\\nu_l}
\\end{equation}

### The Metric

The metric tensor is denoed by $g_{\\mu\\nu}$. The properties $g_{\\mu\\mu}$ are

- A symmetric (0,2) tensor
- Usually nondegenerate, meaning determinent $g=\\abs{g_{\\mu\\nu}}$ does not vanish

The line element can be written as
\\begin{equation}
    ds^2=g_{\\mu\\nu}\\dd x^\\mu\\dd x^\\nu
\\end{equation}
where we say $\\dd x^\\mu$ is just a basis dual vector.

### An Expanding Universe

An example of nontrivial Lorentzian geometry is provided by a four-dimensional cosmological spacetime with metric
\\begin{equation}
    ds^2=-\\dd t^2+a^2(t)[\\dd x^2+ \\dd y^2 +\\dd z^2]
\\end{equation}
This is called Robertson-Walker emtric, one in which spatial slices are geometrically flat. A typical solution for the scale factor $a(t)$ is
\\begin{equation}
    a(t)=t^q, \\quad 0<q<1
\\end{equation}
For a matter-dominated flat universe, $q=\\frac{2}{3}$, while a radiation-dominated flat universe satisfy $q=\\frac{1}{2}$. Notice that at $t=0$, it is a singularity; therefore, it should be excluded from the manifold and
\\begin{equation}
    0<t<\\infty
\\end{equation}
The null path is $ds^2=0$, considering $y$, and $z$ to be constant
\\begin{equation}
    \\begin{aligned}
        0&=-\\dd t^2+t^{2q}(a)\\dd x^2\\\\\\
        \\frac{dx}{dt} &= \\pm t^{-q}
    \\end{aligned}
\\end{equation}

### Causality

Causality refers to the idea that *future events can be understood as consequences of initial conditions plue the laws of physics.* In short, causality enables us to solve initial value problems.

## Curvature

### Overview

A connection is a way of relating vectors in the tagent spaces of nearby points. **Christoffel symbol** is a connection and given by
\\begin{align*}
    \\Gamma^\\lambda_{\\mu\\nu}=\\frac{1}{2}g^{\\lambda\\sigma}(\\partial_\\mu g_{\\nu\\sigma}+\\partial_\\nu g_{\\sigma\\mu}-\\partial_\\sigma g_{\\mu\\nu})
\\end{align*}
Notice that it is called an object or symbol, which means $\\Gamma^\\lambda_{\\mu\\nu}$ is not a tensor.
`
