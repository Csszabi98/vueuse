import type { ShallowRef } from 'vue-demi'
import { onBeforeUpdate, shallowRef } from 'vue-demi'

export type StableTemplateRefsListSetter = (index: number) => (el: Object | null) => void

/**
 * @deprecated Returned template ref list order may be unstable.
 * Edge cases may occur such as https://github.com/vueuse/vueuse/issues/3023
 * Use `refs.set(index)` syntax instead which fixes both issues.
 */
export type UnstableTemplateRefsListSetter = (el: Object | null) => void

export type TemplateRefsList<T> = T[] & {
  set: StableTemplateRefsListSetter & UnstableTemplateRefsListSetter
}

export function useTemplateRefsList<T = Element>(): Readonly<ShallowRef<Readonly<TemplateRefsList<T>>>> {
  const refs = shallowRef<unknown>([]) as ShallowRef<TemplateRefsList<T>>
  const clear = () => {
    refs.value.length = 0
  }

  type OverloadedReturnSignature = ReturnType<StableTemplateRefsListSetter> & ReturnType<UnstableTemplateRefsListSetter>

  refs.value.set = (elOrIndex: Object | null | number): OverloadedReturnSignature => {
    if (typeof elOrIndex === 'number') {
      return ((el: Object | null) => {
        // Fixes: https://github.com/vueuse/vueuse/issues/3023
        if (refs.value[elOrIndex])
          clear()
        if (el)
          refs.value[elOrIndex] = el as T
      }) as OverloadedReturnSignature
    }

    // TODO: @deprecated branch to be removed with a major release
    if (elOrIndex)
      refs.value.push(elOrIndex as T)
  }

  onBeforeUpdate(clear)

  return refs
}
