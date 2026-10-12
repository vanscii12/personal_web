export const metadata = {
  id: 'Lag-Ham-Mech',
  title: "Lagrangian and Hamiltonian Mechanics",
  category: 'Physics',
  description: "test",
  tags: ['Physics'],
  date: '2024'
}

export const content = `
Lagrangian and Hamiltonian Mechanics\\\\

## Calculus of Variations
### The Shortest Path
We will begin with a very simple example: find the shortest path between two points. Here we let these two points lie in $x-y$ plane. From elementary school, we learned that the shortest path between two points is the straight line that connects them. However, how can we proof this is the shortest path?

Let's say we have two points at with $P_1=(x_1,y_1)$ and $P_2=(x_2,y_2)$. The infinitesimal displacement is
$$

    ds=\\sqrt{dx^2+dy^2}

$$
We can write $dy^2$ as the total derivative
$$

    dy = \\frac{dy}{dx}dx = y'(x)dx

$$
where the prime indicates derivative. Substitute into $ds$
$$

    ds = \\sqrt{dx^2+y'(x)^2dx^2} = \\sqrt{1+y'(x)^2}dx

$$
Therefore, the total length between $P_1$ and $P_2$ is
$$

    L=\\int_{P_1}^{P_2} ds=\\int_{x_1}^{x_2}\\sqrt{1+y'(x)^2}dx
    

$$

We can't tell this equation specifies which path between $P_1$ and $P_2$ so far, but, since we want to find a shortest path, now the question turns into finding the variable $y(x)$ that can minimize the integral. We all know it will be a straight line and we will show that later.

### Euler-Lagrange Equation
The example of shortest path leads to the Eq.eq:1-1 where we have $\\sqrt{1+y'(x)^2}$ as the integrand. To be more general, we define the function
$$

    f=f[y(x),y'(x),x]

$$
to be the integrand, which means $f$ is a function of the these three variables. Therefore, Eq.eq:1-1 can be written as
$$

    \\boxed{S = \\int_{x_1}^{x_2}f[y(x),y'(x),x]dx}

$$
where $S$ is called action, and $y(x)$ is the unknown curve joining two points.

Since we want to minimize $S$, let us assume the correct solution is $y=y(x)$. Meanwhile we can define
$$

    Y(x)=y(x) + \\alpha\\eta(x)

$$
to be some wrong neighboring curve, where $\\eta(x)$ is the difference between the correct and wrong curve and $\\alpha$ is some variable. $Y(x)$ is now dependent on $\\alpha$ so that we can write $S=S(\\alpha)$. When $\\alpha=0$, we can recover our assumption by setting $\\alpha=0$. Thus, the proof our assumption, we need to show $S(\\alpha)$ is minimum at $\\alpha=0$.

Writing out the integral $S(\\alpha)$,
$$

    \\begin{aligned}
        S(\\alpha) &= \\int_{x_1}^{x_2} f(Y, Y', x) dx\\\\
        &= \\int_{x_1}^{x_2} f(y+\\alpha\\eta, y'+\\alpha\\eta',x)dx
    \\end{aligned}

$$
Recall the calculus learned in high school, to find an extreme point of function is to find when the derivative of that function equals zero.
$$

    \\frac{dS}{d\\alpha}=\\int_{x_1}^{x_2} \\frac{\\partial f}{\\partial \\alpha}dx =0

$$
The partial derivative of $f$ is
$$

    \\begin{aligned}
        \\frac{\\partial f}{\\partial \\alpha} &= \\frac{\\partial f(y+\\alpha\\eta, y'+\\alpha\\eta',x)}{\\partial \\alpha}\\\\
        &= \\eta\\frac{\\partial f}{\\partial y} + \\eta'\\frac{\\partial f}{\\partial y'}
    \\end{aligned}

$$
Thus,
$$

    \\int_{x_1}^{x_2} \\left(\\eta\\frac{\\partial f}{\\partial y} + \\eta'\\frac{\\partial f}{\\partial y'}\\right)dx = 0
    

$$
The second term can be integrated by parts
$$

    \\begin{aligned}
        \\int_{x_1}^{x_2} \\eta'\\frac{\\partial f}{\\partial y'} dx = \\left[\\eta(x)\\frac{\\partial f}{\\partial y'}\\right]_{x_1}^{x_2}-\\int_{x_1}^{x_2}\\eta(x)\\frac{d}{dx}\\left(\\frac{\\partial f}{\\partial y'}\\right)dx
    \\end{aligned}

$$
The boundary condition tells us that we should start in $P_1$ and end in $P_2$ so that every possible curve should have the same value at these two points. That is
$$

    \\eta(x_1)=\\eta(x_2)=0

$$
Therefore, the first term vanish, and
$$

    \\int_{x_1}^{x_2} \\eta'\\frac{\\partial f}{\\partial y'} dx = -\\int_{x_1}^{x_2}\\eta(x)\\frac{d}{dx}\\left(\\frac{\\partial f}{\\partial y'}\\right)dx

$$
Substitude into Eq.eq:1-2
$$

    \\int_{x_1}^{x_2}\\eta(x)\\left(\\frac{\\partial f}{\\partial y} - \\frac{d}{dx}\\frac{\\partial f}{\\partial y'}\\right)dx=0

$$
This should be satisfied by any choice of $\\eta(x)$, and for a non-trivial result, the term inside the parenthesis must be zero
$$

    \\boxed{\\frac{\\partial f}{\\partial y} - \\frac{d}{dx}\\frac{\\partial f}{\\partial y'}=0}

$$
This is called Euler-Lagrange equation.

## Lagrange's Equation
### D'Alembert's Principle
Let's start with a 3-D system that consists of N-particles. From Newton's second law, we can write
$$

    F_i = m_i \\Ddot{r}_i = m_i \\frac{d^2 \\boldsymbol{r}_i}{dt^2}, \\quad i=1,\\dots,N
    

$$
Note that the bold symbols in the above equation represent the vector nature of that variable; therefore, they are closely related to the coordinates. For example, Newton's law is straightforward in Cartesian coordinate, but once we move to other coordinates such as spherical coordinate, we have to do the messy coordinate transformation, and the Newton's law will change. The power of Lagrange method is that its basic equations stay the same in all coordinates.

Back to Eq. eq:2-1, the important thing is to remove the vector description. To do this, we will introduce the concept of virtual dispalcement, $\\delta r_i$. It is defined as the infinitesimal displacement when the time is frozen. That is

Now, the D'Alembert's Principle states
$$

    \\sum_{i=1}^N (m_i \\Ddot{r}_i - F_i) \\cdot \\delta r_i = 0
    

$$

Next, we need to define a set of generalized coordinates, $q_i$. We require the generalized coordinates to have the property that each position r specifies a unique value of $(q_1,q_2,\\dots,q_S)$ and vice versa; that is
$$

    q_i = q_i (r),\\quad i =1,2,\\dots,S

$$
and
$$

    r = r(q_1,q_2,\\dots,q_S)

$$
where $S$ is the degree of freedom (dof) of the system. For example, we have a particle and given its position in Cartesian coordinate, $r = r(x,y,z)$. We can choose the spherical coordinate as our generalized coordinate so that
$$

    r = r(x,y,z) = r(r,\\theta,\\phi)

$$

From now, the only thing we need to do is some algebra. We can now express the virtual displacement as a partial derivative
$$

    \\delta r_i = \\sum_{j=1}^S \\frac{\\partial r_i}{\\partial q_j}\\delta q_j

$$
and substitute into Eq. eq:1-2
$$

    \\begin{aligned}
        \\sum_{i=1}^N F_i \\cdot \\delta r_i = \\sum_{i=1}^N F_i \\cdot \\sum_{j=1}^S \\frac{\\partial r_i}{\\partial q_j}\\delta q_j = \\sum_{j=1}^S \\left(\\sum_{i=1}^N F_i \\cdot \\frac{\\partial r_i}{\\partial q_j} \\right)\\delta q_j = \\sum_{j=1}^S Q_j \\delta q_j
    \\end{aligned}

$$
where we define
$$

    Q_j = \\sum_{i=1}^N F_i \\cdot \\frac{\\partial r_i}{\\partial q_j}

$$
is the generalized force component. The second part of Eq. eq:2-2 can be done similarly
$$

    \\begin{aligned}
        \\sum_{i=1}^N m_i \\Ddot{r}_i \\cdot \\delta r_i &= \\sum_{j=1}^S\\left(\\sum_{i=1}^N m_i \\Ddot{r}_i \\cdot \\frac{\\partial r_i}{\\partial q_j}\\right)\\delta q_j
    \\end{aligned}

$$
Using the product rule of derivative,
$$

    \\begin{aligned}
        \\sum_{i=1}^N m_i \\Ddot{r}_i \\cdot \\frac{\\partial r_i}{\\partial q_j} = \\frac{d}{dt} \\left(\\sum_{i=1}^N m_i \\dot{r}_i \\cdot \\frac{\\partial r_i}{\\partial q_j}\\right) - \\sum_{i=1}^N m_i \\dot{r}_i \\cdot \\frac{d}{dt}\\left(\\frac{\\partial r_i}{\\partial q_j}\\right)
    \\end{aligned}

$$
Taking the derivative of $r_i$
$$

    \\dot{r} = \\sum_{j=1}^N \\frac{\\partial r_j}{q_j} \\dot{q}_j + \\frac{\\partial r_i}{\\partial t}

$$
`
