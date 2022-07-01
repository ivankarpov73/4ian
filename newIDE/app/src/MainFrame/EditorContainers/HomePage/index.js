// @flow
import * as React from 'react';
import { I18n } from '@lingui/react';
import { Line, Column } from '../../../UI/Grid';
import { type RenderEditorContainerPropsWithRef } from '../BaseEditor';
import {
  type OnCreateFromExampleShortHeaderFunction,
  type OnCreateBlankFunction,
  type OnOpenProjectAfterCreationFunction,
} from '../../../ProjectCreation/CreateProjectDialog';
import { type FileMetadataAndStorageProviderName } from '../../../ProjectsStorage';
import { BuildSection } from './BuildSection';
import { LearnSection } from './LearnSection';
import { PlaySection } from './PlaySection';
import { CommunitySection } from './CommunitySection';
import { TutorialContext } from '../../../Tutorial/TutorialContext';
import { GamesShowcaseContext } from '../../../GamesShowcase/GamesShowcaseContext';
import { ExampleStoreContext } from '../../../AssetStore/ExampleStore/ExampleStoreContext';
import { HomePageHeader } from './HomePageHeader';
import { HomePageMenu, type HomeTab } from './HomePageMenu';

type Props = {|
  project: ?gdProject,

  isActive: boolean,
  projectItemName: ?string,
  project: ?gdProject,
  setToolbar: (?React.Node) => void,

  // Project opening
  canOpen: boolean,
  onOpen: () => void,
  onOpenRecentFile: (file: FileMetadataAndStorageProviderName) => void,
  onOpenExamples: () => void,
  onOpenProjectManager: () => void,

  // Other dialogs opening:
  onOpenHelpFinder: () => void,
  onOpenLanguageDialog: () => void,
  onOpenProfile: () => void,
  onOpenOnboardingDialog: () => void,

  // Project creation
  onCreateFromExampleShortHeader: OnCreateFromExampleShortHeaderFunction,
  onCreateBlank: OnCreateBlankFunction,
  onOpenProjectAfterCreation: OnOpenProjectAfterCreationFunction,
|};

type HomePageEditorInterface = {|
  getProject: () => void,
  updateToolbar: () => void,
  forceUpdateEditor: () => void,
|};

export const HomePage = React.memo<Props>(
  React.forwardRef<Props, HomePageEditorInterface>(
    (
      {
        project,
        canOpen,
        onOpen,
        onOpenRecentFile,
        onCreateFromExampleShortHeader,
        onCreateBlank,
        onOpenProjectAfterCreation,
        onOpenExamples,
        onOpenProjectManager,
        onOpenHelpFinder,
        onOpenLanguageDialog,
        onOpenProfile,
        setToolbar,
        onOpenOnboardingDialog,
      }: Props,
      ref
    ) => {
      const { fetchTutorials } = React.useContext(TutorialContext);
      const { fetchShowcasedGamesAndFilters } = React.useContext(
        GamesShowcaseContext
      );
      const { fetchExamplesAndFilters } = React.useContext(ExampleStoreContext);

      // Load everything when the user opens the home page, to avoid future loading times.
      React.useEffect(
        () => {
          fetchShowcasedGamesAndFilters();
          fetchExamplesAndFilters();
          fetchTutorials();
        },
        [fetchExamplesAndFilters, fetchShowcasedGamesAndFilters, fetchTutorials]
      );

      const getProject = () => {
        return undefined;
      };

      const updateToolbar = () => {
        if (setToolbar) setToolbar(null);
      };

      const forceUpdateEditor = () => {
        // No updates to be done
      };

      React.useImperativeHandle(ref, () => ({
        getProject,
        updateToolbar,
        forceUpdateEditor,
      }));

      const [activeTab, setActiveTab] = React.useState<HomeTab>('Build');

      return (
        <I18n>
          {({ i18n }) => (
            <>
              <Column expand noMargin>
                <HomePageHeader
                  project={project}
                  onOpenLanguageDialog={onOpenLanguageDialog}
                  onOpenProfile={onOpenProfile}
                  onOpenProjectManager={onOpenProjectManager}
                />
                <Line expand noMargin useFullHeight>
                  <HomePageMenu
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                  />
                  {activeTab === 'Build' && (
                    <BuildSection
                      project={project}
                      canOpen={canOpen}
                      onOpen={onOpen}
                      onOpenExamples={onOpenExamples}
                      onOpenRecentFile={onOpenRecentFile}
                    />
                  )}
                  {activeTab === 'Learn' && (
                    <LearnSection
                      onOpenOnboardingDialog={onOpenOnboardingDialog}
                      onOpenExamples={onOpenExamples}
                      onTabChange={setActiveTab}
                      onOpenHelpFinder={onOpenHelpFinder}
                    />
                  )}
                  {activeTab === 'Play' && <PlaySection />}
                  {activeTab === 'Community' && <CommunitySection />}
                </Line>
              </Column>
            </>
          )}
        </I18n>
      );
    }
  ),
  // Prevent any update to the editor if the editor is not active,
  // and so not visible to the user.
  (prevProps, nextProps) => prevProps.isActive || nextProps.isActive
);

export const renderHomePageContainer = (
  props: RenderEditorContainerPropsWithRef
) => (
  <HomePage
    ref={props.ref}
    project={props.project}
    isActive={props.isActive}
    projectItemName={props.projectItemName}
    setToolbar={props.setToolbar}
    canOpen={props.canOpen}
    onOpen={props.onOpen}
    onOpenRecentFile={props.onOpenRecentFile}
    onOpenExamples={props.onOpenExamples}
    onCreateFromExampleShortHeader={props.onCreateFromExampleShortHeader}
    onCreateBlank={props.onCreateBlank}
    onOpenProjectAfterCreation={props.onOpenProjectAfterCreation}
    onOpenProjectManager={props.onOpenProjectManager}
    onOpenHelpFinder={props.onOpenHelpFinder}
    onOpenLanguageDialog={props.onOpenLanguageDialog}
    onOpenProfile={props.onOpenProfile}
    onOpenOnboardingDialog={props.onOpenOnboardingDialog}
  />
);
