export default {
  mounted(el) {
    const all = Array.from(el.querySelectorAll('[data-fade]'))

    const withNumber = all.filter(el => {
      const val = el.getAttribute('data-fade')
      return /^\d+$/.test(val)
    })

    const withoutNumber = all.filter(el => {
      const val = el.getAttribute('data-fade')
      return !/^\d+$/.test(val)
    })

    // 按数字升序排序
    withNumber.sort((a, b) => {
      return Number(a.getAttribute('data-fade')) - Number(b.getAttribute('data-fade'))
    })

    // 合并数组，有数字的在前，无数字的在后
    const combined = [...withNumber, ...withoutNumber]

    combined.forEach((el, i) => {
      el.style.animationDelay = `${(i + 1) * 0.1}s`
    })

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('fade-in-start')
          observer.unobserve(el)
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(el)
  },
}
