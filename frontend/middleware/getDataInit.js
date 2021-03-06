// import { getDataFromUrl } from "~/utils/getData.js"
import { switchFormatFunctions } from '~/utils/utils.js'

import axios from 'axios'

const copyData = (respData, store, dataRef, log) => {
  // COPY A SLICE TO ...

  for (const dataCopy of dataRef.copyTo) {
    log && console.log('\n... -MW- getDataInit / dataCopy :', dataCopy)
    // log  && console.log('... -MW- getDataInit / respData :' , respData )

    // get source data
    let value = respData[dataCopy.from.objectRef]
    // log  && console.log('... -MW- getDataInit / value :' , value )
    if (dataCopy.fieldToCopy) {
      value = value && value[dataCopy.fieldToCopy]
    }
    if (dataCopy.format) {
      value = switchFormatFunctions(value, dataCopy.format)
    }

    const targetData = {
      value: value,
      specialStoreId: dataCopy.toSpecialStore
    }

    store.dispatch('data/setNestedData', targetData)
    // store.commit('data/setDeepNestedData', targetData )
  }
}

export function storeData (dataset, dataRef, resp, store, log) {
  // log && console.log('-MW- getDataInit / dataset.id', dataset.id,' / res :' , resp )
  dataset.data = resp.data
  store.commit('data/pushToInitData', dataset)

  // COPY IT TO data/displayedData
  if (dataRef.displayed) {
    store.commit('data/pushToDisplayedData', dataset)
  }

  // COPY A SLICE TO ...
  if (dataRef.copyTo && dataRef.copyTo.length > 0) {
    // copyData( resp, store, dataRef, log )

    for (const dataCopy of dataRef.copyTo) {
      log &&
        console.log(
          '\n... -MW- getDataInit / dataset.id : ',
          dataset.id,
          ' / dataCopy.fieldToCopy :',
          dataCopy.fieldToCopy
        )

      // get source data
      const sourceObject = resp.data[dataCopy.from.objectRef]
      let value = sourceObject
      if (dataCopy.fieldToCopy) {
        value = sourceObject && sourceObject[dataCopy.fieldToCopy]
      }
      if (dataCopy.format) {
        value = switchFormatFunctions(value, dataCopy.format)
      }
      // log  && console.log('... -MW- getDataInit / dataset.id : ', dataset.id,' / value :' , value )

      const targetData = {
        value: value,
        specialStoreId: dataCopy.toSpecialStore
      }

      // log  && console.log('... -MW- getDataInit / dataset.id : ', dataset.id,' / targetData :' , targetData )

      store.dispatch('data/setNestedData', targetData)
      // store.commit('data/setDeepNestedData', targetData )
    }
  }
}

export default function ({ store }) {
  const log = store.state.log
  log && console.log('\n', '+ '.repeat(20))
  log && console.log('-MW- getDataInit / ... ')

  // log && console.log('-MW- getDataInit / app : ', app)

  // let baseUrl = store.state.data.backendApi
  const promisesArray = []
  const callableFrom = ['url', 'static']

  // STORE DATASETS
  const hasInitdData = store.state.data.initData

  if (!hasInitdData) {
    log && console.log('\n-MW- getDataInit / !hasInitdData ...')

    const dataToStoreAtInitList = store.state.data.defaultDataSetup.initData.store
    // log && console.log('-MW- getDataInit / !hasInitdData / dataToStoreAtInitList :', dataToStoreAtInitList)

    for (const dataRef of dataToStoreAtInitList) {
      log && console.log('\n-MW- getDataInit / dataRef.id :', dataRef.id)
      // log && console.log('-MW- getDataInit / dataRef :', dataRef)
      // log && console.log('-MW- getDataInit / is callable :', callableFrom.includes( dataRef.from ))

      const dataset = {
        id: dataRef.id,
        data: undefined
      }

      // PROMISE FOR DATA FROM RAWOBJECT

      if (dataRef.from === 'rawObject') {
        log && console.log('-MW- getDataInit / dataRef.from :', dataRef.from)

        const initDataFromObjectPromise = new Promise((resolve) => {
          resolve(dataRef.rawObject)
        }).then((resp) => {
          log &&
            console.log(
              '-MW- getDataInit / dataset.id',
              dataset.id,
              ' / res :',
              resp
            )
          dataset.data = resp
          store.commit('data/pushToInitData', dataset)
          // COPY IT TO data/displayedData
          if (dataRef.displayed) {
            store.commit('data/pushToDisplayedData', dataset)
          }
          if (dataRef.copyTo && dataRef.copyTo.length > 0) {
            copyData(resp, store, dataRef, log)
          }
        })
        promisesArray.push(initDataFromObjectPromise)
      }

      // PROMISES FOR DATA FROM URL

      // if ( dataRef.from == 'url' || dataRef == 'static' ) {
      if (callableFrom.includes(dataRef.from)) {
        log && console.log('-MW- getDataInit / dataRef.from :', dataRef.from)

        // GET DATA AND STORE TO data/initData
        const initDataFromUrlPromise = axios
          .get(dataRef.url)
          .then((resp) => {
            storeData(dataset, dataRef, resp, store, log)
          })
          .catch((err) => {
            console.log(
              '-MW- getDataInit / error while loading from dataRef.url :',
              err
            )
            console.log('-MW- trying to load fro backupUrl now...')
            const backupPromises = []
            const initDataFromBackupUrlPromise = axios
              .get(dataRef.backupUrl)
              .then((resp) => {
                console.log(
                  '-MW- trying to load fro backupUrl / initDataFromBackupUrlPromise / resp : ',
                  resp
                )
                storeData(dataset, dataRef, resp, store, log)
              })
            backupPromises.push(initDataFromBackupUrlPromise)
            return Promise.all(backupPromises)
          })
        promisesArray.push(initDataFromUrlPromise)
      }
    }
  }

  // WAIT FOR ALL PROMISES TO RETURN
  log && console.log('\n')
  return Promise.all(promisesArray)
}
