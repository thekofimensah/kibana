/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { EuiPage, EuiErrorBoundary } from '@elastic/eui';
import { i18n } from '@kbn/i18n';
import React, { useEffect } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import { I18nStart, ChromeBreadcrumb, CoreStart } from 'src/core/public';
import { PluginsSetup } from 'ui/new_platform/new_platform';
import { KibanaContextProvider } from '../../../../../src/plugins/kibana_react/public';
import { UMUpdateBadge } from './lib/lib';
import {
  UptimeRefreshContextProvider,
  UptimeSettingsContextProvider,
  UptimeThemeContextProvider,
} from './contexts';
import { CommonlyUsedRange } from './components/common/uptime_date_picker';
import { store } from './state';
import { setBasePath } from './state/actions';
import { PageRouter } from './routes';
import {
  UptimeAlertsContextProvider,
  UptimeAlertsFlyoutWrapper,
} from './components/overview/alerts';
import { kibanaService } from './state/kibana_service';

export interface UptimeAppColors {
  danger: string;
  success: string;
  gray: string;
  range: string;
  mean: string;
  warning: string;
}

export interface UptimeAppProps {
  basePath: string;
  canSave: boolean;
  core: CoreStart;
  darkMode: boolean;
  i18n: I18nStart;
  isApmAvailable: boolean;
  isInfraAvailable: boolean;
  isLogsAvailable: boolean;
  kibanaBreadcrumbs: ChromeBreadcrumb[];
  plugins: PluginsSetup;
  routerBasename: string;
  setBadge: UMUpdateBadge;
  renderGlobalHelpControls(): void;
  commonlyUsedRanges: CommonlyUsedRange[];
  setBreadcrumbs: (crumbs: ChromeBreadcrumb[]) => void;
}

const Application = (props: UptimeAppProps) => {
  const {
    basePath,
    canSave,
    core,
    darkMode,
    i18n: i18nCore,
    plugins,
    renderGlobalHelpControls,
    routerBasename,
    setBadge,
  } = props;

  useEffect(() => {
    renderGlobalHelpControls();
    setBadge(
      !canSave
        ? {
            text: i18n.translate('xpack.uptime.badge.readOnly.text', {
              defaultMessage: 'Read only',
            }),
            tooltip: i18n.translate('xpack.uptime.badge.readOnly.tooltip', {
              defaultMessage: 'Unable to save',
            }),
            iconType: 'glasses',
          }
        : undefined
    );
  }, [canSave, renderGlobalHelpControls, setBadge]);

  kibanaService.core = core;

  // @ts-ignore
  store.dispatch(setBasePath(basePath));

  return (
    <EuiErrorBoundary>
      <i18nCore.Context>
        <ReduxProvider store={store}>
          <KibanaContextProvider services={{ ...core, ...plugins }}>
            <Router basename={routerBasename}>
              <UptimeRefreshContextProvider>
                <UptimeSettingsContextProvider {...props}>
                  <UptimeThemeContextProvider darkMode={darkMode}>
                    <UptimeAlertsContextProvider>
                      <EuiPage className="app-wrapper-panel " data-test-subj="uptimeApp">
                        <main>
                          <UptimeAlertsFlyoutWrapper
                            alertTypeId="xpack.uptime.alerts.monitorStatus"
                            canChangeTrigger={false}
                          />
                          <PageRouter autocomplete={plugins.data.autocomplete} />
                        </main>
                      </EuiPage>
                    </UptimeAlertsContextProvider>
                  </UptimeThemeContextProvider>
                </UptimeSettingsContextProvider>
              </UptimeRefreshContextProvider>
            </Router>
          </KibanaContextProvider>
        </ReduxProvider>
      </i18nCore.Context>
    </EuiErrorBoundary>
  );
};

export const UptimeApp = (props: UptimeAppProps) => <Application {...props} />;
