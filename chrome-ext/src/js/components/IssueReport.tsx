import * as React from 'react'

import CommonUtil from '../utils/common-util'

export default class IssueReport extends React.Component {
  private mutationObserver: MutationObserver

  componentDidMount() {
    this.observeNotesMutation()
  }

  componentWillMount() {
    this.mutationObserver && this.mutationObserver.disconnect()
  }

  observeNotesMutation() {
    const notesContainerNode = document.getElementById('notes-list')
    if (!notesContainerNode) {
      CommonUtil.log('notes-list does not exist')
      return
    }

    this.mutationObserver = new MutationObserver(this.parseMutations)

    const config = { childList: true }
    this.mutationObserver.observe(notesContainerNode, config)
  }

  // find out added note about spent time
  parseMutations = (mutations: MutationRecord[]) => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        const nodeEl = node as HTMLElement
        if (nodeEl.id) {
          console.log(nodeEl.id, nodeEl.innerText);
        }
      })
    })
  }

  render() {
    return <div>issue report</div>
  }
}
