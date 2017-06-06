// Copyright 2015-2017 Parity Technologies (UK) Ltd.
// This file is part of Parity.

// Parity is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// Parity is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with Parity.  If not, see <http://www.gnu.org/licenses/>.

import { applyMiddleware, createStore } from 'redux';

import initMiddleware from './middleware';
import initReducers from './reducers';

import { setApi } from './providers/apiActions';
import { startCachingReverses } from './providers/registry/actions';
import { init as initRequests } from './providers/requestsActions';
import { load as loadWallet } from './providers/walletActions';

import {
  Balances as BalancesProvider,
  Personal as PersonalProvider,
  Signer as SignerProvider,
  Status as StatusProvider
} from './providers';

const storeCreation = window.devToolsExtension
  ? window.devToolsExtension()(createStore)
  : createStore;

export default function (api, browserHistory, forEmbed = false) {
  const reducers = initReducers();
  const middleware = initMiddleware(api, browserHistory, forEmbed);
  const store = applyMiddleware(...middleware)(storeCreation)(reducers);

  store.dispatch(setApi(api));

  BalancesProvider.instantiate(store, api);
  StatusProvider.instantiate(store, api);
  new PersonalProvider(store, api).start();
  new SignerProvider(store, api).start();

  store.dispatch(startCachingReverses());
  store.dispatch(loadWallet(api));
  store.dispatch(initRequests(api));

  return store;
}