// @flow
import * as React from 'react';
import { type FiltersState, useFilters } from '../../UI/Search/FiltersChooser';
import { type Filters } from '../../Utils/GDevelopServices/Filters';
import {
  useSearchStructuredItem,
  type SearchMatch,
} from '../../UI/Search/UseSearchStructuredItem';
import { useSearchItem } from '../../UI/Search/UseSearchItem';
import {
  listListedPrivateGameTemplates,
  type PrivateGameTemplateListingData,
} from '../../Utils/GDevelopServices/Shop';
import { capitalize } from 'lodash';
import { type NavigationState } from '../AssetStoreNavigator';

const defaultSearchText = '';
const excludedTiers = new Set(); // No tiers for game templates.
const firstGameTemplateIds = [];

const getPrivateGameTemplateListingDataSearchTerms = (
  privateGameTemplate: PrivateGameTemplateListingData
) =>
  privateGameTemplate.name +
  '\n' +
  privateGameTemplate.description +
  '\n' +
  privateGameTemplate.categories.join('\n');

type PrivateGameTemplateStoreState = {|
  gameTemplateFilters: ?Filters,
  fetchGameTemplates: () => void,
  privateGameTemplateListingDatas: ?Array<PrivateGameTemplateListingData>,
  error: ?Error,
  shop: {
    privateGameTemplateListingDatasSearchResults: ?Array<PrivateGameTemplateListingData>,
    searchText: string,
    setSearchText: string => void,
    filtersState: FiltersState,
  },
  exampleStore: {
    privateGameTemplateListingDatasSearchResults: ?Array<{|
      item: PrivateGameTemplateListingData,
      matches: SearchMatch[],
    |}>,
    searchText: string,
    setSearchText: string => void,
    filtersState: FiltersState,
  },
|};

export const PrivateGameTemplateStoreContext = React.createContext<PrivateGameTemplateStoreState>(
  {
    gameTemplateFilters: null,
    fetchGameTemplates: () => {},
    privateGameTemplateListingDatas: null,
    error: null,
    shop: {
      privateGameTemplateListingDatasSearchResults: null,
      searchText: '',
      setSearchText: () => {},
      filtersState: {
        chosenFilters: new Set(),
        addFilter: () => {},
        removeFilter: () => {},
        chosenCategory: null,
        setChosenCategory: () => {},
      },
    },
    exampleStore: {
      privateGameTemplateListingDatasSearchResults: null,
      searchText: '',
      setSearchText: () => {},
      filtersState: {
        chosenFilters: new Set(),
        addFilter: () => {},
        removeFilter: () => {},
        chosenCategory: null,
        setChosenCategory: () => {},
      },
    },
  }
);

type PrivateGameTemplateStoreStateProviderProps = {|
  onlyAppStorePrivateGameTemplates?: ?boolean,
  shopNavigationState: NavigationState,
  children: React.Node,
|};

export const PrivateGameTemplateStoreStateProvider = ({
  onlyAppStorePrivateGameTemplates,
  shopNavigationState,
  children,
}: PrivateGameTemplateStoreStateProviderProps) => {
  const [
    gameTemplateFilters,
    setGameTemplateFilters,
  ] = React.useState<?Filters>(null);
  const [error, setError] = React.useState<?Error>(null);
  const [
    privateGameTemplateListingDatas,
    setPrivateGameTemplateListingDatas,
  ] = React.useState<?Array<PrivateGameTemplateListingData>>(null);

  const isLoading = React.useRef<boolean>(false);

  const [shopSearchText, setShopSearchText] = React.useState(defaultSearchText);
  const [exampleStoreSearchText, setExampleStoreSearchText] = React.useState(
    defaultSearchText
  );
  const filtersStateForExampleStore = useFilters();

  const fetchGameTemplates = React.useCallback(
    () => {
      // If the game templates are already loaded, don't load them again.
      if (isLoading.current || privateGameTemplateListingDatas) return;

      (async () => {
        setError(null);
        isLoading.current = true;

        try {
          const fetchedPivateGameTemplateListingDatas = await listListedPrivateGameTemplates(
            {
              onlyAppStorePrivateGameTemplates,
            }
          );

          console.info(
            `Loaded ${
              fetchedPivateGameTemplateListingDatas
                ? fetchedPivateGameTemplateListingDatas.length
                : 0
            } game templates from the store.`
          );

          setPrivateGameTemplateListingDatas(
            fetchedPivateGameTemplateListingDatas
          );
          const gameTemplateFilters: Filters = {
            allTags: [],
            defaultTags: fetchedPivateGameTemplateListingDatas.reduce(
              (allCategories, privateGameTemplateListingData) => {
                return allCategories.concat(
                  privateGameTemplateListingData.categories.map(category =>
                    capitalize(category)
                  )
                );
              },
              []
            ),
            tagsTree: [],
          };
          setGameTemplateFilters(gameTemplateFilters);
        } catch (error) {
          console.error(
            `Unable to load the game templates from the store:`,
            error
          );
          setError(error);
        }

        isLoading.current = false;
      })();
    },
    [
      isLoading,
      onlyAppStorePrivateGameTemplates,
      privateGameTemplateListingDatas,
    ]
  );

  React.useEffect(
    () => {
      if (isLoading.current) return;

      const timeoutId = setTimeout(() => {
        console.info('Pre-fetching game templates from the store...');
        fetchGameTemplates();
      }, 5000);
      return () => clearTimeout(timeoutId);
    },
    [fetchGameTemplates, isLoading]
  );

  const privateGameTemplateListingDatasById = React.useMemo(
    () => {
      if (!privateGameTemplateListingDatas) {
        return null;
      }
      const privateGameTemplateListingDatasById = {};
      privateGameTemplateListingDatas.forEach(
        privateGameTemplateListingData => {
          const id = privateGameTemplateListingData.id;
          if (privateGameTemplateListingDatasById[id]) {
            console.warn(
              `Multiple private game templates with the same id: ${id}`
            );
          }
          privateGameTemplateListingDatasById[
            id
          ] = privateGameTemplateListingData;
        }
      );
      return privateGameTemplateListingDatasById;
    },
    [privateGameTemplateListingDatas]
  );

  const currentPage = shopNavigationState.getCurrentPage();

  const privateGameTemplateListingDatasSearchResultsForExampleStore: ?Array<{|
    item: PrivateGameTemplateListingData,
    matches: SearchMatch[],
  |}> = useSearchStructuredItem(privateGameTemplateListingDatasById, {
    searchText: exampleStoreSearchText,
    chosenCategory: filtersStateForExampleStore.chosenCategory,
    chosenFilters: filtersStateForExampleStore.chosenFilters,
    excludedTiers,
    defaultFirstSearchItemIds: firstGameTemplateIds,
    shuffleResults: false,
  });

  const privateGameTemplateListingDatasSearchResultsForShop: ?Array<PrivateGameTemplateListingData> = useSearchItem(
    privateGameTemplateListingDatasById,
    getPrivateGameTemplateListingDataSearchTerms,
    shopSearchText,
    currentPage.filtersState.chosenCategory,
    currentPage.filtersState.chosenFilters
  );

  console.log(
    'privateGameTemplateListingDatasSearchResultsForShop',
    privateGameTemplateListingDatasSearchResultsForShop
  );

  const PrivateGameTemplateStoreState = React.useMemo(
    () => ({
      privateGameTemplateListingDatas,
      error,
      gameTemplateFilters,
      fetchGameTemplates,
      shop: {
        privateGameTemplateListingDatasSearchResults: privateGameTemplateListingDatasSearchResultsForShop,
        searchText: shopSearchText,
        setSearchText: setShopSearchText,
        filtersState: currentPage.filtersState,
      },
      exampleStore: {
        privateGameTemplateListingDatasSearchResults: privateGameTemplateListingDatasSearchResultsForExampleStore,
        searchText: exampleStoreSearchText,
        setSearchText: setExampleStoreSearchText,
        filtersState: filtersStateForExampleStore,
      },
    }),
    [
      privateGameTemplateListingDatas,
      error,
      gameTemplateFilters,
      fetchGameTemplates,
      privateGameTemplateListingDatasSearchResultsForExampleStore,
      privateGameTemplateListingDatasSearchResultsForShop,
      shopSearchText,
      exampleStoreSearchText,
      currentPage.filtersState,
      filtersStateForExampleStore,
    ]
  );

  return (
    <PrivateGameTemplateStoreContext.Provider
      value={PrivateGameTemplateStoreState}
    >
      {children}
    </PrivateGameTemplateStoreContext.Provider>
  );
};
