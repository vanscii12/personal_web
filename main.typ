#import "template.typ": *

// Take a look at the file `template.typ` in the file panel
// to customize this template and discover how it works.
#show: project.with(
  title: "Hydrodynamics and MHD",
  authors: (
    "Kevin",
  ),
  date: "April 1, 2023",
)
#show link: underline
#set math.equation(numbering: "(1)")
#set heading(numbering: "1.1")

// We generated the example code below so you can see how
// your document will look. Go ahead and replace it with
// your own content!

= Hydrodynamics
How to describe the fluid motion:
 + Lagrangian varibles: Velocity, pressure, density etc are defined with respect to particular fluid element.
 + Eulerian varibales: Use a fixed spatial coordinate, velocity, pressure etc are defined as vector or scalar field which are functon of fixed positions and time. Eg: $arrow(V)(arrow(x),t)$

To calculate the time derivative of Eulerian varibale for a fixed fluid element,

$ d/ (d t)arrow(v)(arrow(x),t)= (dif arrow(v))/ (dif t) + (d arrow(x))/(d t)dot.c arrow(nabla)arrow(v) $
where $(d arrow(x))/ (d t)$ is the fluid velocity $arrow(v)$,
$ d/(d t)arrow(v)(arrow(x), t)= (dif arrow(v))/(dif t)+ arrow(v) dot.c arrow(nabla)arrow(v) $
Here we define
$ D/(D t)=dif /(dif t) +arrow(v)dot.c arrow(nabla)arrow(v) $ <eq:lagderope>
to be Lagrangian/comovnig time derivative operator. For stationary flow, $(D arrow(v))/(D t)=arrow(v)dot.c arrow(nabla)arrow(v)$, which means if $arrow(v)$ is changing spatially in the direction of $arrow(v)$ , then fluid elements are still accelerating. Another example, $(D T)/(D t)=(dif T)/ (dif t) +arrow(v)dot.c arrow(nabla) T$ is the change of temperature and $arrow(v) dot.c arrow(nabla)T$ is the #link("https://en.wikipedia.org/wiki/Advection")[advection].

= Conservation Laws
== Mass Conservation
Let the flow has density $rho(arrow(x), t)$ and velocity $arrow(v)(arrow(x),t)$. The mass flux (mass per unit area perpendicular to velocity per unit time) is $rho arrow(v)$, $arrow.r.double$ the rate at which mass crosses a surface area element $d arrow(S)$ is $ rho arrow(v)dot.c d arrow(S) $

For fixed volume, the change of mass must equals to the mass flow in/out of hte surface that enclose the volume, which means,
$ d/ (d t)integral_v rho d V&=-integral.cont_S rho arrow(v)dot.c d arrow(S) $
Applying the divergence theorem,
$ integral_v dif/(dif t)rho d V&=- integral_v arrow(nabla)dot.c (rho arrow(v))dot.c d V $
Therefore,
$ (dif rho)/(dif t)+arrow(nabla)dot.c (rho arrow(v))=0, text("    Continuity equation") $ <eq:continuity>

[The conservation laws in continuum mechanics can generally be written in so-called "conservative form" as 
$dif/(dif t)(text("conserved quantity per unit volume"))+arrow(nabla)dot.c(text("flux of conserved quantity"))=0$]

Expand the divergence,
$ (dif rho)/(dif t)+arrow(v)dot.c arrow(nabla)rho +rho arrow(nabla)dot.c arrow(v)=0 \ 
(D rho)/(D t)=-rho arrow(nabla)dot.c arrow(v)
$
therefore the rate of change of density of individual fluid elements is related to the divergneceo fhte velocity field. If $arrow(nabla)arrow(v)<0 arrow.r.double (D rho)/(D t)>0$, which is the compression. If $arrow(nabla)arrow(v)<0 arrow.r.double (D rho)/(D t)<0$, which is the expansion. Flows with $arrow(nabla)arrow(v)=0$ is incompressible.
== Momentum Conservation
Individual fluid elements obey Newton's second law of motion
$ arrow(F)=m arrow(a)=m (D arrow(v))/(D t) $
where $m=rho d V$.

The most important forces fluid in astrophysics that make up $arrow(F)$ are #emph("gravity") and _pressure_ (and magnetic forces will be discuss in MHD). For gravity,
$ arrow(F)_("gravity")=-m arrow(nabla)Phi $
where $Phi$ is the gravitational potential.

For pressure, consider a fluid element of rectangular shape, which side length is $d x, d y, d z$. The volumn will be $d V=d x d y d z$. The pressure on the vertical faces is
$ &-P(x, y,z+ d z)d x d y hat(z)+P(x,y,z)d x d y hat(z) \
=&-d x d y hat(z)(dif P)/(dif z)d z\
=&-d V (dif P)/(dif z)hat(z)
$
Similarly for the other sides, and the total net pressure will be 
$ sum P=-d V arrow(nabla) P $
Hence, the Newton's second law becomes,
$
rho d V (D arrow(v))/(D t)&=arrow(F) \
rho d V (D arrow(v))/(D t) &= arrow(F)_("gravity")+sum P \
rho d V (D arrow(v))/(D t) &= -rho d V arrow(nabla)Phi - d V arrow(nabla) P\
rho (D arrow(v))/(D t)&=-rho arrow(nabla)Phi-arrow(nabla)P\
rho((dif arrow(v))/(dif t)+arrow(v)dot.c arrow(nabla)arrow(v))&=-arrow(nabla)P -rho arrow(nabla)Phi, text("   the Euler equation")
$ <eq:euler>

We can also write the momentum equation in the conservative form,
$ (dif (rho arrow(v)))/(dif t)-arrow(v) (dif rho)/(dif t)+rho arrow(v)dot.c arrow(nabla)arrow(v)+arrow(nabla)P=-rho arrow(nabla)Phi $
where the first two term is given by the chain-rule. Eliminating $(dif rho)/(dif t) =- arrow(nabla)dot.c(rho arrow(v))$ from continuity equation (@eq:continuity)

$ (dif (rho arrow(v)))/(dif t)+arrow(v)arrow(nabla)dot.c(rho arrow(v)) +rho arrow(v)dot.c arrow(nabla)arrow(v)+arrow(nabla)P=-rho arrow(nabla)Phi $ <eq:momcon1>
The last three terms can be written as a divergence using Cartesian tensor notation.

$ dif /(dif t)(rho v^i)+nabla_j(rho v^i v^j+delta^(i j)P=-rho nabla^i Phi $ <eq:momcon2>

where $arrow(v)arrow(nabla)dot.c(rho arrow(v)) +rho arrow(v)dot.c arrow(nabla)arrow(v)=arrow(nabla)dot.c(rho arrow(v)arrow(v))$ by chain-rule. The $i,j$ indicates the $x,y,z$ coordinates, and $delta^(i j)$ is Kronecker delta. 

$rho v^i$ is the $i^(t h)$ component of momentum density (momentum per unit volume)

$rho v^i v^j+delta^(i j)P$ is the flux of $i^(t h)$ component of momentum in $j$-direction

$rho v^i v^j$ is the Reynolds stress tensor. The advection of $i^(t h)$ component of momentum density $rho v^i$ due to motion in $j$-direction

Integrate @eq:momcon2 over a fixed volume and apply Gauss' theorem
$ d/(d t)integral_V rho v^i d V+integral.cont (rho v^i v^j + delta^(i j))d S_j=-integral_V rho nabla^i Phi d V $ <eq:momcon3>
The first term is the rate of change of momentum density in volume. The second term is surface integral of momentum flux out of volume, due to advection (Reynolds stress) and pressure forces across surface. The last term is the total external gravitational force on volume, and this is a source of momentum for the fluid in the volume.

== Energy Conservation
=== Mechanical Energy
Consider the Euler equation (@eq:euler) again,
$ rho((dif arrow(v))/(d t)+arrow(v)dot.c arrow(nabla)arrow(v))+arrow(nabla)P+rho arrow(nabla)Phi=0 $
Take the scalar product with $arrow(v)$,
$ arrow(v)rho((dif arrow(v))/(d t) + arrow(v)dot.c arrow(nabla)arrow(v)) + arrow(v)arrow(nabla)P+arrow(v)rho arrow(nabla)Phi&=0 \
rho dif/(dif t)(1/2 v^2) + rho arrow(v)dot.c arrow(nabla)(1/2 v^2) + arrow(v)dot.c arrow(nabla)P +
rho arrow(v)dot.c arrow(nabla)Phi&=0 $
The first term can be written as
$ rho dif/(dif t)(1/2 v^2)=dif/(dif t)(1/2rho v^2)-1/2v^2 (dif rho)/(dif t) $
The second term can be written as 
$ rho arrow(v)dot.c arrow(nabla)(1/2 v^2)&=arrow(nabla)(1/2rho arrow(v) v^2)-1/2v^2 arrow(nabla)dot.c(rho arrow(v)) \
&=arrow(nabla)(1/2rho arrow(v) v^2)+1/2v^2(dif rho)/(dif t)
$
The third term can be written as 
$ arrow(v)dot.c arrow(nabla)P=arrow(nabla)dot.c(arrow(v)P)-P arrow(nabla)dot.c arrow(v) $
The last term can be written as
$ rho arrow(v)dot.c arrow(nabla)Phi&=arrow(nabla)dot.c(rho arrow(v)Phi)-Phi arrow(nabla)dot.c(rho arrow(v)) \
&=arrow(nabla)dot.c(rho arrow(v)Phi)+Phi (dif rho)/(dif t) $
Put these four term together and substitude continuity equation (@eq:continuity),
$ dif/(dif t)(1/2 rho v^2)-1/2v^2 (dif rho)/(dif t)+ arrow(nabla)(1/2rho arrow(v) v^2)+1/2v^2(dif rho)/(dif t)+arrow(nabla)dot.c(P arrow(v))-P arrow(nabla)dot.c arrow(v) \ +arrow(nabla)dot.c(rho Phi arrow(v))+Phi (dif rho)/(dif t)=0\
dif/(dif t)(1/2 rho v^2)+ arrow(nabla)dot.c(1/2rho arrow(v) v^2))+arrow(nabla)dot.c(P arrow(v))-P arrow(nabla)dot.c arrow(v)+arrow(nabla)dot.c(rho Phi arrow(v))+Phi (dif rho)/(dif t)=0 $
Therefore, for a time-independent external potential,
$ dif/(dif t)(1/2 rho v^2 +rho Phi)+arrow(nabla)dot.c[(1/2 rho v^2+rho Phi+P)arrow(v)]=P arrow(nabla)dot.c arrow(v) $ <eq:energycon>
where the $1/2 rho v^2$ is the kinetic energy density, $rho Phi$ is the potential energy density. The second term inside $arrow(nabla)$ is the mechanical energy flux, including the rate of change at which work is being done by pressure forces across surface. The right-hand-side represent the gain or loss of mechanical enregy into internal energy through $P d V$ work.

=== Internal Energy
The first law of thermal dynamics 
$ d U=d Q-p d V $
or $ d U +P d V= d Q (=T d S text("for reversible processes")) $ <eq:1thermal1>
$U$ is the internal energy and $Q$ is the heat.  Apply Lagrange operator (@eq:lagderope),
$ (D U)/(D t)+P (D V)/(D t)=(D Q)/(D t) $ <eq:1thermal2>
where $V$ is the volume of infinitesimal fluid element with fixed mass $m$. From basic knowledge, $rho = m/V arrow.r.double V=m/ rho$. Define $u=U/V$ to be internal energy density. Then $U=u V=u m/rho$. Substitude $U$ into @eq:1thermal2
$ (D U)/(D t)+P (D V)/(D t)&=(D Q)/(D t)\
m D/(D t)(u/rho)+P m D/(D t)(1/rho)&=(D Q)/(D t)\
m/rho (D u)/(D t)-(m u)/rho^2 (D rho)/(D t)-(m P)/(rho^2) (D rho)/(D t)&=(D Q)/(D t)\
m/rho ((D u)/(D t)-(u+P)/rho (D rho)/(D t))&=(D Q)/(D t)\
m/rho ((D u)/(D t)-(u+P)/rho (D rho)/(D t))&=(D Q)/(D t)
$
With continuity equation (@eq:continuity),
$ m/rho [(D u)/(D t)+(u+P) arrow(nabla)dot.c arrow(v)]&=(D Q)/(D t) $ <eq:1thermal3>
wher $u+P$ is the entropy density, and $(D Q)/(D t)$ is the heating/cooling term [More on @appendix:enthalpy].

For heating, let $epsilon.alt$ be the heat input per unit mass due to some process, which measured in erg/g. Therefore, the totla heating rate of fluid element is $m epsilon.alt$. For cooling, we will discuss two types of cooling: conductive cooling, and optically thin cooling.

For conductive cooling, let $arrow(F)=$heat flux. The cooling rate will be 
$ integral.cont arrow(F)dot.c d arrow(S)=integral_V arrow(nabla)dot.c arrow(F)d V $
Integrate over the whole volume, 
$ integral_V arrow(nabla)dot.c arrow(F)d V=(arrow(nabla)dot.c arrow(F))V =(arrow(nabla)dot.c arrow(F)) m/rho $

For optically thin cooling (e.g. photons or neutrinos from material which is transparent to these particles), let $Lambda=$ cooling rate per unit volume. Then the cooling rate will be $Lambda V=Lambda m/rho$. 

Substitude the equation of these two cooling rate and heating rate into @eq:1thermal3,
$ m/rho [(D u)/(D t)+(u+P) arrow(nabla)dot.c arrow(v)]&=(D Q)/(D t) \
m/rho [(D u)/(D t)+(u+P) arrow(nabla)dot.c arrow(v)]&=m epsilon.alt - (arrow(nabla)dot.c arrow(F)) m/rho-Lambda m/rho $
$ (D u)/(D t)+(u+P) arrow(nabla)dot.c arrow(v)&=rho epsilon.alt-arrow(nabla)dot.c arrow(F)-Lambda
$ <eq:internalenergy>

When the flow is so fast that the work done by the pressure is much faster than heating or coolingm this is called *adiabetic flow*. The entropy of each fluid element is conserved
$ (D s)/(D t)=0 $
where $s$ is the entropy per unit mass.

@eq:internalenergy can also be written as
$ (D u)/(D t)+(u+P) arrow(nabla)dot.c arrow(v)=(D u)/(D t)-(u+P)/(rho)(D rho)/(D t) =0 $ <eq:35>
according to continuity equation. For idea gas with constant ratio of specific heat $gamma$, the change in internal energy with constant pressure is 
$ Delta U =n C_V Delta T $
with @eq:mayer, this relation can be rewrite as
$ Delta U &=n (R)/(gamma - 1) Delta T \
U &= (n R T)/(gamma - 1)\
U &= (P V)/(gamma - 1)\
u&=P/(gamma -1)
$
Now we can write @eq:35 as
$ D/(D t)(P/(gamma -1))-(P/(gamma -1)+P)/rho (D rho)/(D t)&=0\
1/(gamma-1)(D P)/(D t)-(P+gamma P- P)/((gamma - 1)rho)(D rho)/(D t)&=0\
(D ln(P))/(D t)-(D ln(rho^gamma))/(D t)&=0\
D/(D t)ln(P rho^(-gamma))&=0\
D/(D t)(P rho^(-gamma))&=0
$

Returning to the full internal energy equation (@eq:internalenergy),
$ (D u)/(D t)+(u+P) arrow(nabla)dot.c arrow(v)&=rho epsilon.alt-arrow(nabla)dot.c arrow(F)-Lambda\
(dif u)/(dif t)+arrow(v)dot.c arrow(nabla)u+u dot.c arrow(nabla)arrow(v)+P arrow(nabla)dot.c arrow(v)&=rho epsilon.alt-arrow(nabla)dot.c arrow(F)-Lambda\
(dif u)/(dif t)+ arrow(nabla)dot.c(arrow(v)u)&=-P arrow(nabla)dot.c arrow(v)+rho epsilon.alt-arrow(nabla)dot.c arrow(F)-Lambda\
$
Add this with the mechanical energy equation (@eq:energycon),
$ 
dif/(dif t)(1/2 rho v^2 +rho Phi + U)+arrow(nabla)dot.c[(1/2 rho v^2+rho Phi+P+u)arrow(v)]=rho epsilon.alt-arrow(nabla)dot.c arrow(F)-Lambda
$ <eq:totalenergyconserve>

To make a summary
$ 
(dif rho)/(dif t)+arrow(nabla)dot.c(rho arrow(v))=0\
rho((dif arrow(v))/(dif t)+arrow(v)dot.c arrow(nabla)arrow(v))=-arrow(nabla)P-rho arrow(nabla)Phi\
(dif rho)/(dif t)+arrow(v)dot.c arrow(nabla)u+(u+P)arrow(nabla)dot.c arrow(v)=rho epsilon.alt -arrow(nabla)dot.c arrow(F)-Lambda
$

== Examples
=== Hydrostatic Equilibrium
Hydristatic means there is no time dependence. The Euler equation (@eq:euler) becomes
$ 0=-arrow(nabla)P-rho arrow(nabla)Phi $
where $-arrow(nabla)Phi = g$ for gravitational acceleration. For Earth's atmosphere,
$ (d P)/(d z) =-rho g $
For a spherical star,
$ (d P)/(d r)=-(G M)/r^2 rho $

=== Vorticity Evolution
Here we define *vorticity* to be 
$ arrow(omega)=arrow(nabla)times arrow(v) $
which means $arrow(omega)$ is the curl of the fluid velocity. Vorticity is related closely to another quantity known as _circulation_ $Gamma$,
$ Gamma = integral.cont arrow(v)dot.c d arrow(l) $
where the integral is taken around some closed path at fixed time. By Stokes' theorem
$ Gamma &= integral.double (arrow(nabla) times arrow(v)) dot d arrow(A)\
&=integral.double arrow(omega) dot d arrow(A)
$





=== Potential flow and Bernoulli's Equation
=== Sound Wave
=== Shocks


= Magnetohydrodynamics
















#pagebreak()
= Appendix
== Useful Equation:
Chain-rule: $(d (u v))/(d t)=u (d v)/(d t)+v (d u)/(d t)$

== Other concepts:
=== Enthalpy <appendix:enthalpy>
Enthalpy is the sum of the system's internal energy and the product of its pressure and volume,
$ H(S, P)=U +P V $
It measures the total heat present in the thermodynamic system where the pressure is constant. As a contrast, entropy measures the disorder in a thermodynamic system. When dividing by $V$, the enthalpy density is
$ H/V=u+P $
where $u=U/V$ is the internal enregy density.

=== Heat Capacity Ratio
The heat capacity ratio is defined to be
$ gamma=(C_P)/C_V =macron(C)_P /macron(C)_V =c_P/c_V $
where $C$ is the heat capacity, $macron(C)$ is the molar heat capacity, and $c$ is the specific heat capacity. The $P$ and $V$ subscript indicates the constant volume or pressure condition. According to Mayer's relation,
$ C_V=C_P-n R $
$ C_V = (n R)/(gamma - 1) $ <eq:mayer>

For the adiabetic process, $P V^(-gamma)$ is constant. Begin with $d W= d  E$ and the first law of thermodynamics,
$ d W&= d E\
-p d V&=(d E)/(d T) d T\
$
where $(d E)/(d T)=alpha N k_B $ is the heat capacity. $alpha$ depends on the degree of freedom of the system according to equipartition theorem. $d 
 T$ can find by ideal gas law,
$ P V&= N k_B T\
T&=(P V)/(N k_B)\
d T &= 1/(N K_B)d(P V)\
d T &=1/(N k_B)(P d V+V d P)
$
Substitude back,
$ -p d V&=alpha (P d V+V d P) \
-(1+alpha) P d V&=alpha V d P \
-gamma integral (d V)/V&=integral (d P)/P \
-gamma ln(V_2/V_1)&=ln(P_2/P_1) \
P_1 V_1^gamma&=P_2 V_2^gamma=text("const") $
where $gamma=(alpha +1)/alpha$. Still with ideal gas law $P V= n R T$, we can infer that 
$ P^(1-gamma)T^gamma=text("const") $




