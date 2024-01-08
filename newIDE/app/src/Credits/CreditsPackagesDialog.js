// @flow
import { Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import * as React from 'react';
import { Column } from '../UI/Grid';
import GDevelopThemeContext from '../UI/Theme/GDevelopThemeContext';
import Coin from '../UI/CustomSvgIcons/Coin';
import {
  ColumnStackLayout,
  LineStackLayout,
  ResponsiveLineStackLayout,
} from '../UI/Layout';
import FlatButton from '../UI/FlatButton';
import Text from '../UI/Text';
import Dialog from '../UI/Dialog';
import CreditsStatusBanner from './CreditsStatusBanner';
import { CreditsPackageStoreContext } from '../AssetStore/CreditsPackages/CreditsPackageStoreContext';
import PlaceholderError from '../UI/PlaceholderError';
import PlaceholderLoader from '../UI/PlaceholderLoader';
import RaisedButton from '../UI/RaisedButton';
import { formatProductPrice } from '../AssetStore/ProductPriceTag';
import BackgroundText from '../UI/BackgroundText';
import Link from '../UI/Link';
import Window from '../Utils/Window';
import CreditsPackagePurchaseDialog from '../AssetStore/CreditsPackages/CreditsPackagePurchaseDialog';
import { type CreditsPackageListingData } from '../Utils/GDevelopServices/Shop';

const styles = {
  creditsPackage: {
    display: 'flex',
    flex: 1,
    borderRadius: 8,
    padding: 16,
  },
  titleContainer: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
  },
  backgroundText: {
    textAlign: 'left',
  },
};

type Props = {
  onClose: () => void,
};

const CreditsPackagesDialog = ({ onClose }: Props) => {
  const {
    error,
    fetchCreditsPackages,
    creditsPackageListingDatas,
  } = React.useContext(CreditsPackageStoreContext);
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const [
    purchasingCreditsPackageListingData,
    setPurchasingCreditsPackageListingData,
  ] = React.useState<?CreditsPackageListingData>(null);

  React.useEffect(
    () => {
      fetchCreditsPackages();
    },
    [fetchCreditsPackages]
  );

  console.log(creditsPackageListingDatas);

  return (
    <I18n>
      {({ i18n }) => (
        <Dialog
          title={<Trans>Purchase credits</Trans>}
          open
          maxWidth="md"
          onRequestClose={onClose}
          actions={[
            <FlatButton
              key="close"
              label={<Trans>Close</Trans>}
              onClick={onClose}
            />,
          ]}
        >
          <ColumnStackLayout noMargin>
            <CreditsStatusBanner displayPurchaseAction={false} />
            {error ? (
              <PlaceholderError onRetry={fetchCreditsPackages}>
                <Trans>
                  Can't load the credits packages. Verify your internet
                  connection or retry later.
                </Trans>
              </PlaceholderError>
            ) : !creditsPackageListingDatas ? (
              <PlaceholderLoader />
            ) : (
              <ResponsiveLineStackLayout>
                {creditsPackageListingDatas.map(creditsPackageListingData => {
                  const { id, name, description } = creditsPackageListingData;
                  return (
                    <div
                      style={{
                        ...styles.creditsPackage,
                        border: `1px solid ${gdevelopTheme.palette.secondary}`,
                      }}
                      key={id}
                    >
                      <ColumnStackLayout
                        alignItems="center"
                        justifyContent="space-between"
                        noMargin
                        expand
                      >
                        <div style={styles.titleContainer}>
                          <LineStackLayout
                            justifyContent="space-between"
                            alignItems="flex-end"
                            expand
                          >
                            <LineStackLayout noMargin alignItems="flex-end">
                              <Coin />
                              <Text size="sub-title" noMargin>
                                {name}
                              </Text>
                            </LineStackLayout>
                            <Text size="body-small" color="secondary" noMargin>
                              {formatProductPrice({
                                productListingData: creditsPackageListingData,
                                i18n,
                              })}
                            </Text>
                          </LineStackLayout>
                        </div>

                        <Column noMargin alignItems="center" expand>
                          <Text
                            size="body-small"
                            noMargin
                            color="secondary"
                            align="left"
                          >
                            {description}
                          </Text>
                        </Column>
                        <RaisedButton
                          primary
                          onClick={() =>
                            setPurchasingCreditsPackageListingData(
                              creditsPackageListingData
                            )
                          }
                          label={<Trans>Purchase</Trans>}
                          fullWidth
                        />
                      </ColumnStackLayout>
                    </div>
                  );
                })}
              </ResponsiveLineStackLayout>
            )}
            <BackgroundText style={styles.backgroundText}>
              <Trans>
                Not sure how many credits you need? Check{' '}
                <Link
                  href="{TODO}"
                  onClick={() => Window.openExternalURL('{TODO}')}
                >
                  this guide
                </Link>{' '}
                to help you decide.
              </Trans>
            </BackgroundText>
          </ColumnStackLayout>
          {!!purchasingCreditsPackageListingData && (
            <CreditsPackagePurchaseDialog
              creditsPackageListingData={purchasingCreditsPackageListingData}
              onClose={() => setPurchasingCreditsPackageListingData(null)}
            />
          )}
        </Dialog>
      )}
    </I18n>
  );
};

export default CreditsPackagesDialog;
