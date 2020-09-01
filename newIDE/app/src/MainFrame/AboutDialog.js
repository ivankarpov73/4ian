// @flow
import { Trans } from '@lingui/macro';

import React, { PureComponent } from 'react';
import { List, ListItem } from '../UI/List';
import Dialog from '../UI/Dialog';
import FlatButton from '../UI/FlatButton';
import { Tabs, Tab } from '../UI/Tabs';
import { Column, Line } from '../UI/Grid';
import Window from '../Utils/Window';
import Text from '../UI/Text';
import PreferencesContext from './Preferences/PreferencesContext';
import {
  getUpdateStatusLabel,
  getUpdateButtonLabel,
  canDownloadUpdate,
  type UpdateStatus,
} from './UpdaterTools';
import Changelog from './Changelog';
import { getIDEVersion, getGDCoreVersion } from '../Version';

type Props = {
  open: boolean,
  onClose: Function,
  updateStatus: UpdateStatus,
};

type State = {|
  currentTab: string,
|};

const styles = {
  logo: {
    width: '100%',
  },
};

// There must be missing tons of people.
// If you contributed to GDevelop but you're not in the list, please
// send a Pull Request on GitHub or open an issue ;)
const contributors = [
  // GitHub contributors
  {
    name: 'Victor Levasseur',
    description:
      'Numerous contributions to GDevelop core and various extensions',
  },
  {
    name: 'Lizard-13',
    description:
      'Numerous contributions to GDevelop (particle engine, bugfixes, new conditions, examples, tutorials...)',
  },
  {
    name: "Christina 'Castpixel' Antoinette Neofotistou",
    description: 'Art and assets for the 8-bit Space Shooter example.',
    link: 'https://www.patreon.com/castpixel',
  },
  { name: 'ale26reg', description: 'Contributions to GDevelop' },
  { name: 'dos1', description: 'Contributions to GDevelop' },
  {
    name: 'Aurélien Vivet',
    description:
      'Numerous contributions to GDevelop (Video extension, advanced shapes, bugfixes, new conditions, examples...)',
    link: 'https://www.witly.fr',
  },
  {
    name: 'Todor Imreorov',
    description:
      'Numerous contributions to GDevelop, added Piskel sprite editor and jfxr',
  },
  { name: 'brylie', description: 'Contributions to GDevelop' },
  { name: 'Nnarol', description: 'Contributions to GDevelop' },
  { name: 'wild-master', description: 'Contributions to GDevelop' },
  { name: 'RandomShaper', description: 'Contributions to GDevelop' },
  { name: 'RyanNerd', description: 'Contributions to GDevelop' },
  { name: 'greater', description: 'Contributions to GDevelop' },
  { name: 'triptych', description: 'Contributions to GDevelop' },
  {
    name: 'Wend1go',
    description: 'Contributions to GDevelop, Tutorials, Examples',
  },
  { name: 'mattiascibien', description: 'Contributions to GDevelop' },
  { name: 'araujo921', description: 'Contributions to GDevelop' },
  { name: 'ronnystandtke', description: 'Contributions to GDevelop' },
  {
    name: 'Thomas Flecy',
    description: 'Contributions to GDevelop (original sound object extension)',
  },
  {
    name: 'Arthur Pacaud (arthuro555)',
    description: 'Contributions to GDevelop and Moderation on the Forum',
    link: 'https://forum.gdevelop-app.com/u/arthuro555/summary',
  },

  // Community members:
  {
    name: 'ddabrahim',
    description: 'Lots of examples bundled with GDevelop',
    link: 'https://gametemplates.itch.io/',
  },
  {
    name: 'Gametemplates',
    description: 'Examples bundled with GDevelop',
    link: 'https://gametemplates.itch.io/',
  },
  { name: 'Mats', description: 'Tutorials, Examples' },
  { name: 'erdo', description: 'Tutorials, Examples' },
  { name: 'Jubileuksen3', description: 'Tutorials, Examples' },
  { name: 'LucaTexas', description: 'Tutorials, Examples' },
  { name: 'Kink', description: 'Forum moderator, tutorials, Examples' },
  { name: 'RicoTrooper', description: 'Tutorials' },
  { name: 'kalel', description: 'Tutorials' },
  { name: 'mtarzaim', description: 'Tutorials' },
  { name: 'Darkhog', description: 'Examples' },
  { name: 'Ricardo Graca', description: 'Tutorials, Examples' },
  { name: 'Diego Schiavon', description: 'Indiegogo Ubuntu contributor' },
  { name: 'conceptgame', description: 'Indiegogo super contributor' },
  {
    name: 'Jose David Cuartas Correa',
    description:
      'Author of Digitopolis (a book on how to make games with GDevelop4)',
  },

  {
    name: 'François Dumortier',
    description: 'GDevelop logo design',
    link: 'http://www.fdumortier.com',
  },
  {
    name: 'Constantine Shvetsov',
    description: 'Design of all the awesome icons',
  },
  {
    name: 'MillionthVector',
    description: 'Assets of various examples',
  },
];

export default class AboutDialog extends PureComponent<Props, State> {
  state = {
    currentTab: 'about',
  };

  _openContributePage = () => {
    Window.openExternalURL('https://gdevelop-app.com/contribute/');
  };

  _openLink = (link: string) => {
    if (!link) return;

    Window.openExternalURL(link);
  };

  _changeTab = (currentTab: string) => {
    this.setState({ currentTab });
  };

  render() {
    const { open, onClose, updateStatus } = this.props;
    const { currentTab } = this.state;
    if (!open) return null;

    const updateStatusString = getUpdateStatusLabel(updateStatus.status);
    const updateButtonLabel = getUpdateButtonLabel(updateStatus.status);

    return (
      <Dialog
        actions={[
          <FlatButton
            key="website"
            label={<Trans>GDevelop Website</Trans>}
            primary={false}
            onClick={() => Window.openExternalURL('http://gdevelop-app.com')}
          />,
          <FlatButton
            key="close"
            label={<Trans>Close</Trans>}
            primary={false}
            onClick={onClose}
          />,
        ]}
        onRequestClose={onClose}
        cannotBeDismissed={false}
        open={open}
        maxWidth="sm"
        noMargin
      >
        <PreferencesContext.Consumer>
          {({ values, checkUpdates }) => (
            <Column noMargin>
              <img
                src="res/GD-logo.png"
                alt="GDevelop logo"
                style={styles.logo}
              />
              <Tabs value={currentTab} onChange={this._changeTab}>
                <Tab label={<Trans>About GDevelop</Trans>} value="about" />
                <Tab label={<Trans>What's new?</Trans>} value="changelog" />
                <Tab label={<Trans>Contributors</Trans>} value="contributors" />
              </Tabs>
              {currentTab === 'about' && (
                <React.Fragment>
                  <Column>
                    <Line>
                      <Text>
                        <Trans>
                          GDevelop {getIDEVersion()} based on GDevelop.js{' '}
                          {getGDCoreVersion()}
                        </Trans>
                      </Text>
                    </Line>
                    <Line>
                      <Text>{updateStatusString}</Text>
                    </Line>
                    <Line justifyContent="center">
                      {!!updateStatusString && (
                        <FlatButton
                          label={updateButtonLabel}
                          onClick={() =>
                            checkUpdates(canDownloadUpdate(updateStatus.status))
                          }
                        />
                      )}
                    </Line>
                  </Column>
                </React.Fragment>
              )}
              {currentTab === 'changelog' && (
                <Column>
                  <Changelog />
                </Column>
              )}
              {currentTab === 'contributors' && (
                <React.Fragment>
                  <Column>
                    <Text>
                      <Trans>
                        GDevelop was created by Florian "4ian" Rival.
                      </Trans>
                    </Text>
                    <Text>
                      <Trans>Contributors, in no particular order:</Trans>
                    </Text>
                  </Column>
                  <List>
                    {contributors.map(contributor => (
                      <ListItem
                        key={contributor.name}
                        primaryText={contributor.name}
                        secondaryText={contributor.description}
                        secondaryTextLines={
                          contributor.description.length < 30 ? 1 : 2
                        }
                        displayLinkButton={contributor.link ? true : false}
                        onOpenLink={() =>
                          this._openLink(contributor.link || '')
                        }
                      />
                    ))}
                  </List>
                  <Column expand>
                    <Text>
                      <Trans>
                        Thanks to all users of GDevelop! There must be missing
                        tons of people, please send your name if you've
                        contributed and you're not listed.
                      </Trans>
                    </Text>
                    <Line alignItems="center" justifyContent="center">
                      <FlatButton
                        label={<Trans>Contribute to GDevelop</Trans>}
                        onClick={this._openContributePage}
                      />
                    </Line>
                  </Column>
                </React.Fragment>
              )}
            </Column>
          )}
        </PreferencesContext.Consumer>
      </Dialog>
    );
  }
}
