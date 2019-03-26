export const mutationTypes = {
  setEntries: 'SET_ENTRIES'
}

export const state = () => ({
  entries: []
})

export const mutations = {
  [mutationTypes.setEntries](state, payload) {
    state.entries = payload
  }
}

export const actions = {
  setEntries({ commit }, entries) {
    commit(mutationTypes.setEntries, entries)
  }
}
