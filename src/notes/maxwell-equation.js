export const metadata = {
  id: 'maxwell-equation',
  title: "Maxwell's Equations",
  category: 'Physics',
  description: 'Electromagnetic theory fundamentals, covering the four fundamental equations describing electricity and magnetism.',
  tags: ['Physics', 'Electrodynamics'],
  date: '2024'
}

export const content = `
A point charge $q$ will have an electric field

$$\\vec{E}(\\vec{r}) = \\frac{1}{4\\pi\\epsilon_0}\\frac{q}{r^2}\\hat{r}$$

The electric field is pointing radially from the point charge. In this case, we have a positive charge, so the electric field is pointing outward.

Now we can define the **flux** of $\\vec{E}$ through a surface $S$ to be a surface integral

$$\\Phi_E \\equiv \\int_S \\vec{E}\\cdot d\\vec{a}$$

We can evaluate this equation:

$$\\oint\\vec{E}\\cdot d\\vec{a} = \\frac{q}{\\epsilon_0}$$

where $q$ is the charge enclosed in the surface $S$. Instead of only a point charge, now we have multiple charges inside this surface. According to the superposition theorem, we can find the net electric field:

$$\\oint\\vec{E}_{\\text{net}}\\cdot d\\vec{a} = \\frac{Q_{\\text{enc}}}{\\epsilon_0}$$

where $Q_{\\text{enc}}$ is the total charge enclosed.

Applying the divergence theorem, we can turn the surface integral into a volume integral:

$$\\oint\\vec{E}\\cdot d\\vec{a} = \\int_\\nu (\\nabla\\cdot\\vec{E})\\cdot d\\tau$$

Meantime, $Q_{\\text{enc}}$ can be expressed as:

$$Q_{\\text{enc}} = \\int_\\nu\\rho d\\tau$$

where $\\rho$ is the charge density.

Therefore, we have:

$$\\nabla\\cdot\\vec{E} = \\frac{\\rho}{\\epsilon_0}$$
`
