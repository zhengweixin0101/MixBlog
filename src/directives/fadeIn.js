export default {
  mounted(el) {
    const elements = Array.from(el.querySelectorAll('[data-fade]'))

    const positioned = []
    const unpositioned = []

    elements.forEach((el) => {
      const attr = el.getAttribute('data-fade')
      const index = parseInt(attr, 10)
      if (!isNaN(index)) {
        positioned[index - 1] = el
      } else {
        unpositioned.push(el)
      }
    })

    const final = []
    let upIndex = 0
    for (let i = 0; i < elements.length; i++) {
      if (positioned[i]) {
        final.push(positioned[i])
      } else if (upIndex < unpositioned.length) {
        final.push(unpositioned[upIndex++])
      }
    }

    while (upIndex < unpositioned.length) {
      final.push(unpositioned[upIndex++])
    }

    final.forEach((el, i) => {
      el.style.animationDelay = `${(i + 1) * 0.07}s`
    })

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('fade-in-start')
          observer.unobserve(el)
        }
      },
      { threshold: 0.05 }
    )

    observer.observe(el)
  }
}