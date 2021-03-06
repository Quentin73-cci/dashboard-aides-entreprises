import { chooseBooleanMode } from '~/utils/utils.js'

export default function ({ store, env, route, redirect }) {
  const log = store.state.log
  log && console.log('\n', '+ '.repeat(20))
  log && console.log('-MW- getRouteConfig ... ')

  const path = route.path

  const queryLocale = route.query.locale
  const queryIframe = route.query.iframe

  // set locale if part of url
  if (queryLocale) {
    // log && console.log('-MW- getRouteConfig / queryLocale : ', queryLocale)
    store.commit('setLocale', queryLocale)
  }

  // set iframe param if part of url OR if override from env file
  const overrideIframe = env.CONFIG_APP.overrideIframe
  if (overrideIframe || queryIframe) {
    let isIframe = false
    // log && console.log('-MW- getRouteConfig / queryLocale : ', queryLocale)
    if (overrideIframe) {
      isIframe = true
    } else {
      isIframe = chooseBooleanMode(queryIframe)
    }
    store.commit('setIframe', isIframe)
  }

  // retrieve local route config
  // log && console.log('-MW- getRouteConfig / path : ', path)
  const currentRouteConfig = store.getters.getCurrentRouteConfig(path)
  log &&
    console.log(
      '-MW- getRouteConfig / currentRouteConfig : ',
      currentRouteConfig
    )

  // reroute to error / or home if currentRouteConfig is undefined
  if (typeof currentRouteConfig === 'undefined') { redirect('/') }

  // set local route config
  else {
    store.commit('setLocalRouteConfig', currentRouteConfig)
  }

  log && console.log('\n')
}
