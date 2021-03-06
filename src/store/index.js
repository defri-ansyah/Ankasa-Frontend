import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
import airLinesModule from './modules/admin/airlines'
import flightRouteModule from './modules/admin/flightroute'
import auth from './modules/auth/auth'
import customerModule from './modules/customer/customer'
import createPersistedState from 'vuex-persistedstate'
import SecureLS from 'secure-ls'
import user from './modules/user/user'
const ls = new SecureLS({ isCompression: false })

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    findtickets: [],
    city: [],
    myprofile: {},
    mybooking: [],
    orderdetail: {},
    token: null
  },
  mutations: {
    SET_FINDTICKETS (state, payload) {
      state.findtickets = payload
    },
    SET_CITY (state, payload) {
      state.city = payload
    },
    SET_MYPROFILE (state, payload) {
      state.myprofile = payload
    },
    SET_MYBOOKING (state, payload) {
      state.mybooking = payload
    },
    SET_ORDERDETAIL (state, payload) {
      state.orderdetail = payload
    },
    SET_TOKEN (state, payload) {
      state.token = payload
    },
    LOGOUT_INDEX (state) {
      state.findtickets = []
      state.city = []
      state.myprofile = {}
      state.mybooking = []
      state.orderdetail = {}
      state.token = null
    }
  },
  actions: {
    interceptorRequest (context) {
      axios.interceptors.request.use(function (config) {
        config.headers.Authorization = `Bearer ${localStorage.getItem('token')}`
        return config
      }, function (error) {
        return Promise.reject(error)
      })
    },
    getTickets (context, payload) {
      return new Promise((resolve, reject) => {
        axios.get(`${process.env.VUE_APP_SERVICE_API}/api/ticketing/find?routeFrom=${payload.routeFrom}&routeTo=${payload.routeTo}&flightClass=${payload.flightClass}&tripType=${payload.triptype}&tripDate=${payload.tripdate}&facilities=${payload.facilities}&price=${payload.price}&airline=${payload.airlines}&departureTime=${payload.departureTime}&timeArrived=${payload.timeArrived}&transit=${payload.transit}`)
          .then((res) => {
            context.commit('SET_FINDTICKETS', res.data.result)
            resolve(res.data.result)
          })
          .catch((err) => {
            reject(err)
          })
      })
    },
    getCity (context, payload) {
      return new Promise((resolve, reject) => {
        axios.get(`${process.env.VUE_APP_SERVICE_API}/api/data-lookup/city`)
          .then((res) => {
            resolve(res)
            context.commit('SET_CITY', res.data.result)
          })
          .catch((err) => {
            reject(err)
          })
      })
    },
    getMyProfile (context, payload) {
      return new Promise((resolve, reject) => {
        axios.get(`${process.env.VUE_APP_SERVICE_API}/api/user/detail`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
          .then((res) => {
            context.commit('SET_MYPROFILE', res.data.data)
          })
          .catch((err) => {
            reject(err)
          })
      })
    },
    getMyBooking (context, payload) {
      return new Promise((resolve, reject) => {
        axios.get(`${process.env.VUE_APP_SERVICE_API}/api/user/my-booking`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
          .then((res) => {
            context.commit('SET_MYBOOKING', res.data.data)
          })
          .catch((err) => {
            console.log(err.response)
          })
      })
    },
    getOrderDetail (context, payload) {
      return new Promise((resolve, reject) => {
        axios.get(`${process.env.VUE_APP_SERVICE_API}/api/ticketing/detail/${localStorage.getItem('orderid')}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
          .then((res) => {
            context.commit('SET_ORDERDETAIL', res.data.result)
          })
          .catch((err) => {
            console.log(err.response)
          })
      })
    },
    sorting ({ dispatch, commit }, { routeFrom, routeTo, tripType, tripDate, sort, flightClass }) {
      dispatch('interceptorRequest')
      return new Promise((resolve, reject) => {
        axios.get(`${process.env.VUE_APP_SERVICE_API}/api/ticketing/find?routeFrom=${routeFrom}&routeTo=${routeTo}&flightClass=${flightClass}&tripType=${tripType}&tripDate=${tripDate}&sort=${sort}`)
          .then((result) => {
            console.log('result sorting:>> ', result.data.result)
            commit('SET_FINDTICKETS', result.data.result)
          }).catch((err) => {
            console.log('err :>> ', err)
          })
      })
    }
  },
  getters: {
    getTickets (state) {
      return state.findtickets
    },
    getCity (state) {
      return state.city
    },
    getMyProfile (state) {
      return state.myprofile
    },
    getMyBooking (state) {
      return state.mybooking
    },
    getOrderDetail (state) {
      return state.orderdetail
    }
  },
  modules: {
    airlines: airLinesModule,
    flightroute: flightRouteModule,
    auth: auth,
    customer: customerModule,
    user: user
  },
  plugins: [
    createPersistedState({
      storage: {
        getItem: key => ls.get(key),
        setItem: (key, value) => ls.set(key, value),
        removeItem: key => ls.remove(key)
      },
      reducer (val) {
        if (val.user.token === null) { // val.user.token (your user token for example)
          return {}
        }
        return val
      }
    })
  ]
})
