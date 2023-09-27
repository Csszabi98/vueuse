import { defineComponent, h, isVue2, nextTick, ref, toRefs } from 'vue-demi'
import { describe, expect, it } from 'vitest'
import { mount } from '../../.test'
import { useTemplateRefsList } from '.'

if (isVue2) {
  // Vue 2 is not supported
  it('stub', () => {})
}
else {
  const createComponent1 = (legacy: boolean) => defineComponent({
    setup() {
      const list = ref([1, 2, 3])
      const refs = useTemplateRefsList()
      return { list, refs }
    },
    render() {
      return h(
        'div',
        this.list.map((item, index) => h('div', {
          ref: legacy ? this.refs.set : this.refs.set(index),
          id: `div${item}`,
        })),
      )
    },
  })

  interface ChildAPI {
    foo: () => string
  }

  const Child = defineComponent({
    props: {
      id: {
        type: Number,
        required: true,
      },
    },
    setup(props) {
      const { id } = toRefs(props)
      const foo = () => {
        return `foo${id.value}`
      }
      return { foo }
    },
    render() {
      return h('div')
    },
  })

  const createTestComp2 = (legacy: boolean) => defineComponent({
    setup() {
      const list = ref([1, 2, 3])
      const refs = useTemplateRefsList<ChildAPI>()
      return { list, refs }
    },
    render() {
      return h(
        'div',
        this.list.map((item, index) => h(Child, {
          ref: legacy ? this.refs.set : this.refs.set(index),
          id: item,
        })),
      )
    },
  })

  const syntaxes = [
    { legacy: true, syntax: 'refs.set' },
    { legacy: false, syntax: 'refs.set(index)' },
  ]

  describe('useTemplateRefsList', () => {
    it('should be defined', () => {
      expect(useTemplateRefsList).toBeDefined()
    })

    it.each(syntaxes)('ref all 3 divs', ({ legacy }) => {
      const vm = mount(createComponent1(legacy))

      expect(vm.refs).toBeDefined()
      expect(vm.refs.length).toBe(3)
      expect(vm.refs[0]).toBe(vm.$el.querySelector('#div1'))
      expect(vm.refs[1]).toBe(vm.$el.querySelector('#div2'))
      expect(vm.refs[2]).toBe(vm.$el.querySelector('#div3'))
    })

    it.each(syntaxes)('v-for source update', async ({ legacy }) => {
      const vm = mount(createComponent1(legacy))

      vm.list = [1, 2, 3, 4]
      await nextTick()

      expect(vm.refs.length).toBe(4)
      expect(vm.refs[3]).toBe(vm.$el.querySelector('#div4'))
    })

    it.each(syntaxes)('`$syntax` syntax call child component methods', async ({ legacy }) => {
      const vm = mount(createTestComp2(legacy))

      expect(vm.refs[0].foo()).toBe('foo1')
      expect(vm.refs[1].foo()).toBe('foo2')
      expect(vm.refs[2].foo()).toBe('foo3')
    })
  })
}
