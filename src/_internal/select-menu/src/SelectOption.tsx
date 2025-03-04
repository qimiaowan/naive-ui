import {
  h,
  inject,
  toRef,
  defineComponent,
  Transition,
  PropType,
  VNode
} from 'vue'
import { internalSelectionMenuInjectionKey } from './SelectMenu'
import { TreeNode } from 'treemate'
import { useMemo } from 'vooks'
import type { SelectBaseOption } from '../../../select/src/interface'
import { CheckmarkIcon } from '../../icons'
import NBaseIcon from '../../icon'

const checkMarkIcon = h(CheckmarkIcon)

function renderCheckMark (show: boolean, clsPrefix: string): VNode {
  return (
    <Transition name="fade-in-scale-up-transition">
      {{
        default: () =>
          show ? (
            <NBaseIcon
              clsPrefix={clsPrefix}
              class={`${clsPrefix}-base-select-option__check`}
            >
              {{
                default: () => checkMarkIcon
              }}
            </NBaseIcon>
          ) : null
      }}
    </Transition>
  )
}

export default defineComponent({
  name: 'NBaseSelectOption',
  props: {
    clsPrefix: {
      type: String,
      required: true
    },
    tmNode: {
      type: Object as PropType<TreeNode<SelectBaseOption>>,
      required: true
    }
  },
  setup (props) {
    const {
      valueRef,
      pendingTmNodeRef,
      multipleRef,
      valueSetRef,
      handleOptionClick,
      handleOptionMouseEnter
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    } = inject(internalSelectionMenuInjectionKey)!
    const rawNodeRef = toRef(props.tmNode, 'rawNode')
    const isPendingRef = useMemo(() => {
      const { value: pendingTmNode } = pendingTmNodeRef
      if (!pendingTmNode) return false
      return props.tmNode.key === pendingTmNode.key
    })
    function handleClick (e: MouseEvent): void {
      const { tmNode } = props
      if (tmNode.disabled) return
      handleOptionClick(e, tmNode)
    }
    function handleMouseEnter (e: MouseEvent): void {
      const { tmNode } = props
      if (tmNode.disabled) return
      handleOptionMouseEnter(e, tmNode)
    }
    function handleMouseMove (e: MouseEvent): void {
      const { tmNode } = props
      const { value: isPending } = isPendingRef
      if (tmNode.disabled || isPending) return
      handleOptionMouseEnter(e, tmNode)
    }
    return {
      multiple: multipleRef,
      rawNode: rawNodeRef,
      isGrouped: useMemo(() => {
        const { tmNode } = props
        const { parent } = tmNode
        return parent && parent.rawNode.type === 'group'
      }),
      isPending: isPendingRef,
      isSelected: useMemo(() => {
        const { value } = valueRef
        const { value: multiple } = multipleRef
        if (value === null) return false
        const optionValue = rawNodeRef.value.value
        if (multiple) {
          const { value: valueSet } = valueSetRef
          return valueSet.has(optionValue)
        } else {
          return value === optionValue
        }
      }),
      handleMouseMove,
      handleMouseEnter,
      handleClick
    }
  },
  render () {
    const {
      clsPrefix,
      rawNode,
      isSelected,
      isPending,
      isGrouped,
      multiple,
      handleClick,
      handleMouseEnter,
      handleMouseMove
    } = this
    const showCheckMark = multiple && isSelected
    const children = rawNode.render
      ? [
        rawNode.render(rawNode, isSelected),
        renderCheckMark(showCheckMark, clsPrefix)
      ]
      : [rawNode.label, renderCheckMark(showCheckMark, clsPrefix)]
    return (
      <div
        class={[
          `${clsPrefix}-base-select-option`,
          rawNode.class,
          {
            [`${clsPrefix}-base-select-option--disabled`]: rawNode.disabled,
            [`${clsPrefix}-base-select-option--selected`]: isSelected,
            [`${clsPrefix}-base-select-option--grouped`]: isGrouped,
            [`${clsPrefix}-base-select-option--pending`]: isPending
          }
        ]}
        style={rawNode.style}
        onClick={handleClick}
        onMouseenter={handleMouseEnter}
        onMousemove={handleMouseMove}
      >
        {children}
      </div>
    )
  }
})
