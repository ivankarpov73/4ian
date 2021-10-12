// @flow
import { Trans, t } from '@lingui/macro';

import  * as React from 'react';
import Background from '../UI/Background';
import TextField from '../UI/TextField';
import { Line, Spacer } from '../UI/Grid';
import ChevronLeft from '@material-ui/icons/ChevronLeft';
import ChevronRight from '@material-ui/icons/ChevronRight';
import IconButton from '../UI/IconButton';
import FlatButton from '../UI/FlatButton';
import InlineCheckbox from '../UI/InlineCheckbox';
import Text from '../UI/Text';
import {
  type SearchInEventsInputs,
  type ReplaceInEventsInputs,
} from './EventsSearcher';
import RaisedButton from '../UI/RaisedButton';
import { ColumnStackLayout } from '../UI/Layout';
import {
  shouldCloseOrCancel,
  shouldValidate,
} from '../UI/KeyboardShortcuts/InteractionKeys';
import { Tabs, Tab } from '../UI/Tabs';

type Props = {|
  onSearchInEvents: SearchInEventsInputs => void,
  onReplaceInEvents: ReplaceInEventsInputs => void,
  onCloseSearchPanel: () => void,
  resultsCount: ?number,
  hasEventSelected: boolean,
  onGoToPreviousSearchResult: () => ?gdBaseEvent,
  onGoToNextSearchResult: () => ?gdBaseEvent,
|};

export type SearchPanelInterface = {|
  focus: () => void,
  markSearchResultsDirty: () => void,
|};

const SearchPanel = ({
  onSearchInEvents,
  onReplaceInEvents,
  onCloseSearchPanel,
  resultsCount,
  hasEventSelected,
  onGoToPreviousSearchResult,
  onGoToNextSearchResult
}: Props, ref) => {
  const searchTextField = React.useRef<?TextField>(null);

  const focusSearchField = React.useCallback((): void => {
    if (searchTextField.current) searchTextField.current.focus();
  }, []);

  React.useImperativeHandle(ref, () => ({
    focus: focusSearchField,
    markSearchResultsDirty: (): void => {
      setSearchResultsDirty(true);
    }
  }));

  const [searchText, setSearchText] = React.useState<string>('')
  const [replaceText, setReplaceText] = React.useState<string>('')
  const [matchCase, setMatchCase] = React.useState<boolean>(false)
  const [searchInActions, setSearchInActions] = React.useState<boolean>(true)
  const [searchInConditions, setSearchInConditions] = React.useState<boolean>(true)
  const [searchInEventStrings, setSearchInEventStrings] = React.useState<boolean>(true)
  const [searchInSelection, setSearchInSelection] = React.useState<boolean>(false) // eslint-disable-line no-unused-vars
  const [searchResultsDirty, setSearchResultsDirty] = React.useState<boolean>(false)
  const [currentTab, setCurrentTab] = React.useState<string>('search-and-replace');

  React.useEffect(() => {
    setSearchResultsDirty(true);
  }, [searchText, searchInActions, searchInConditions, searchInEventStrings, matchCase]);

  React.useEffect(focusSearchField, [currentTab]);

  const launchSearch = () => {
    onSearchInEvents({
      searchInSelection,
      searchText,
      matchCase,
      searchInActions,
      searchInConditions,
      searchInEventStrings,
    });
  };

  const launchReplace = () => {
    launchSearch();

    onReplaceInEvents({
      searchInSelection,
      searchText,
      replaceText,
      matchCase,
      searchInActions,
      searchInConditions,
      searchInEventStrings,
    });
  };

  const launchSearchIfResultsDirty = () => {
    if (searchResultsDirty) {
      launchSearch();
      setSearchResultsDirty(false);
    }
  };

  const isSearchAndReplaceTab = React.useCallback((): boolean => (currentTab === 'search-and-replace'), [currentTab]);

  return (
    <Background noFullHeight noExpand>
      <Tabs value={currentTab} onChange={setCurrentTab}>
        <Tab label={<Trans>Search and replace</Trans>} value="search-and-replace" />
        <Tab
          label={<Trans>Search in event sentences</Trans>}
          value="search-in-event-sentences"
        />
      </Tabs>
      <ColumnStackLayout>
        <Line alignItems="baseline" noMargin>
          <TextField
            ref={searchTextField}
            margin="dense"
            hintText={isSearchAndReplaceTab() ? t`Text to search in parameters` : t`Text to search in event sentences`}
            onChange={(e, searchText) => { setSearchText(searchText)}}
            onKeyPress={event => {
              if (shouldValidate(event)) {
                launchSearchIfResultsDirty();
              }
            }}
            onKeyUp={event => {
              if (shouldCloseOrCancel(event)) {
                onCloseSearchPanel();
              }
            }}
            value={searchText}
            fullWidth
          />
          <Spacer />
          <RaisedButton
            disabled={!searchText}
            primary
            label={<Trans>Search</Trans>}
            onClick={() => {
              if (!searchResultsDirty) {
                onGoToNextSearchResult();
              } else {
                launchSearchIfResultsDirty();
              }
            }}
          />
        </Line>
        {isSearchAndReplaceTab() && (
          <Line alignItems="baseline" noMargin>
            <TextField
              margin="dense"
              hintText={t`Text to replace in parameters`}
              onChange={(e, replaceText) => { setReplaceText(replaceText) }}
              onKeyPress={event => {
                if (shouldValidate(event)) {
                  launchReplace();
                }
              }}
              onKeyUp={event => {
                if (shouldCloseOrCancel(event)) {
                  onCloseSearchPanel();
                }
              }}
              value={replaceText}
              fullWidth
            />
            <Spacer />
            <RaisedButton
              disabled={
                !replaceText ||
                !searchText ||
                (!hasEventSelected && searchInSelection)
              }
              label={<Trans>Replace</Trans>}
              onClick={launchReplace}
            />
          </Line>
        )}
        <Line noMargin alignItems="center" justifyContent="space-between">
          <Line noMargin alignItems="center">
            <InlineCheckbox
              label={<Trans>Case insensitive</Trans>}
              checked={!matchCase}
              onCheck={(e, checked) => {setMatchCase(!checked)}}
            />
            <Text>
              <Trans>Search in:</Trans>
            </Text>
            <Spacer />
            <InlineCheckbox
              label={<Trans>Conditions</Trans>}
              checked={searchInConditions}
              onCheck={(e, checked) => {setSearchInConditions(checked)}}
            />
            <InlineCheckbox
              label={<Trans>Actions</Trans>}
              checked={searchInActions}
              onCheck={(e, checked) => {setSearchInActions(checked)}}
            />
            <InlineCheckbox
              label={<Trans>Texts</Trans>}
              checked={searchInEventStrings}
              onCheck={(e, checked) => {setSearchInEventStrings(checked)}}
            />
            {/* <InlineCheckbox //TODO: Implement search/replace in selection
              label={<Trans>Replace in selection</Trans>}
              checked={searchInSelection}
              onCheck={(e, checked) =>
                this.setState({ searchInSelection: checked })}
            /> */}
          </Line>
          <Line noMargin alignItems="center">
            <Text>
              {resultsCount === null || resultsCount === undefined
                ? ''
                : resultsCount !== 0
                ? `${resultsCount} results`
                : `No results`}
            </Text>
            <IconButton
              disabled={!resultsCount}
              onClick={() => {
                onGoToPreviousSearchResult();
              }}
            >
              <ChevronLeft />
            </IconButton>
            <IconButton
              disabled={!resultsCount}
              onClick={() => {
                onGoToNextSearchResult();
              }}
            >
              <ChevronRight />
            </IconButton>
            <FlatButton
              key="close"
              label={<Trans>Close</Trans>}
              primary={false}
              onClick={() => {
                onCloseSearchPanel();
              }}
            />
          </Line>
        </Line>
      </ColumnStackLayout>
    </Background>
  );
}

export default React.forwardRef<Props, SearchPanelInterface>(SearchPanel);
