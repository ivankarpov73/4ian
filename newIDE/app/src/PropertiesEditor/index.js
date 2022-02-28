// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import SemiControlledTextField from '../UI/SemiControlledTextField';
import InlineCheckbox from '../UI/InlineCheckbox';
import ResourceSelector from '../ResourcesList/ResourceSelector';
import ResourcesLoader from '../ResourcesLoader';
import Subheader from '../UI/Subheader';
import FlatButton from '../UI/FlatButton';
import SelectField from '../UI/SelectField';
import SelectOption from '../UI/SelectOption';
import Edit from '@material-ui/icons/Edit';
import ColorField from '../UI/ColorField';
import { MarkdownText } from '../UI/MarkdownText';
import { rgbOrHexToRGBString } from '../Utils/ColorTransformer';
import FormHelperText from '@material-ui/core/FormHelperText';

import {
  type ResourceKind,
  type ResourceSource,
  type ChooseResourceFunction,
} from '../ResourcesList/ResourceSource';
import { type ResourceExternalEditor } from '../ResourcesList/ResourceExternalEditor.flow';
import {
  TextFieldWithButtonLayout,
  ResponsiveLineStackLayout,
  ColumnStackLayout,
} from '../UI/Layout';
import RaisedButton from '../UI/RaisedButton';
import UnsavedChangesContext, {
  type UnsavedChanges,
} from '../MainFrame/UnsavedChangesContext';
import { Line } from '../UI/Grid';
import Text from '../UI/Text';
import useForceUpdate from '../Utils/UseForceUpdate';

// An "instance" here is the objects for which properties are shown
export type Instance = Object; // This could be improved using generics.
export type Instances = Array<Instance>;

// "Value" fields are fields displayed in the properties.
export type ValueFieldCommonProperties = {|
  name: string,
  getLabel?: Instance => string,
  getDescription?: Instance => string,
  getExtraDescription?: Instance => string,
  disabled?: boolean,
  onEditButtonClick?: Instance => void,
  onClick?: Instance => void,
|};

// "Primitive" value fields are "simple" fields.
export type PrimitiveValueField =
  | {|
      valueType: 'number',
      getValue: Instance => number,
      setValue: (instance: Instance, newValue: number) => void,
      ...ValueFieldCommonProperties,
    |}
  | {|
      valueType: 'string',
      getValue: Instance => string,
      setValue: (instance: Instance, newValue: string) => void,
      getChoices?: ?() => Array<{| value: string, label: string |}>,
      ...ValueFieldCommonProperties,
    |}
  | {|
      valueType: 'boolean',
      getValue: Instance => boolean,
      setValue: (instance: Instance, newValue: boolean) => void,
      ...ValueFieldCommonProperties,
    |}
  | {|
      valueType: 'color',
      getValue: Instance => string,
      setValue: (instance: Instance, newValue: string) => void,
      ...ValueFieldCommonProperties,
    |}
  | {|
      valueType: 'textarea',
      getValue: Instance => string,
      setValue: (instance: Instance, newValue: string) => void,
      ...ValueFieldCommonProperties,
    |};

// "Resource" fields are showing a resource selector.
type ResourceField = {|
  valueType: 'resource',
  resourceKind: ResourceKind,
  getValue: Instance => string,
  setValue: (instance: Instance, newValue: string) => void,
  ...ValueFieldCommonProperties,
|};

// A value field is a primitive or a resource.
export type ValueField = PrimitiveValueField | ResourceField;

// A field can be a primitive, a resource or a list of fields
export type Field =
  | PrimitiveValueField
  | ResourceField
  | {|
      name: string,
      type: 'row' | 'column',
      title?: ?string,
      children: Array<Object>,
    |};

// The schema is the tree of all fields.
export type Schema = Array<Field>;

type Props = {|
  onInstancesModified?: Instances => void,
  instances: Instances,
  schema: Schema,
  mode?: 'column' | 'row',

  // If set, render the "extra" description content from fields
  // (see getExtraDescription).
  renderExtraDescriptionText?: (extraDescription: string) => string,
  unsavedChanges?: ?UnsavedChanges,

  // Optional context:
  project?: ?gdProject,
  resourceSources?: ?Array<ResourceSource>,
  onChooseResource?: ?ChooseResourceFunction,
  resourceExternalEditors?: ?Array<ResourceExternalEditor>,
|};

const styles = {
  columnContainer: {
    display: 'flex',
    flexDirection: 'column',
  },
  fieldContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  field: {
    flex: 1,
    width: 'auto',
  },
  subPropertiesEditorContainer: {
    marginLeft: 15,
  },
  subHeader: {
    paddingLeft: 0,
  },
};

const getFieldValue = (
  instances: Instances,
  field: ValueField,
  defaultValue?: any
): any => {
  if (!instances[0]) {
    console.log(
      'getFieldValue was called with an empty list of instances (or containing undefined). This is a bug that should be fixed'
    );
    return defaultValue;
  }

  let value = field.getValue(instances[0]);
  for (var i = 1; i < instances.length; ++i) {
    if (value !== field.getValue(instances[i])) {
      if (typeof defaultValue !== 'undefined') value = defaultValue;
      break;
    }
  }

  return value;
};

const getFieldLabel = (instances: Instances, field: ValueField): any => {
  if (!instances[0]) {
    console.log(
      'PropertiesEditor._getFieldLabel was called with an empty list of instances (or containing undefined). This is a bug that should be fixed'
    );
    return field.name;
  }

  if (field.getLabel) return field.getLabel(instances[0]);

  return field.name;
};

const PropertiesEditor = ({
  onInstancesModified,
  instances,
  schema,
  mode,
  renderExtraDescriptionText,
  unsavedChanges,
  project,
  resourceSources,
  onChooseResource,
  resourceExternalEditors,
}: Props) => {
  const forceUpdate = useForceUpdate();

  const _onInstancesModified = (instances: Instances) => {
    // This properties editor is dealing with fields that are
    // responsible to update their state (see field.setValue).

    if (unsavedChanges) unsavedChanges.triggerUnsavedChanges();
    if (onInstancesModified) onInstancesModified(instances);
    forceUpdate();
  };

  const getFieldDescription = (
    instances: Instances,
    field: ValueField
  ): ?string => {
    if (!instances[0]) {
      console.log(
        'PropertiesEditor._getFieldDescription was called with an empty list of instances (or containing undefined). This is a bug that should be fixed'
      );
      return undefined;
    }

    const descriptions: Array<string> = [];
    if (field.getDescription)
      descriptions.push(field.getDescription(instances[0]));
    if (renderExtraDescriptionText && field.getExtraDescription)
      descriptions.push(
        renderExtraDescriptionText(field.getExtraDescription(instances[0]))
      );

    return descriptions.join('\n') || undefined;
  };

  const renderInputField = (field: ValueField) => {
    if (field.name === 'PLEASE_ALSO_SHOW_EDIT_BUTTON_THANKS') return null; // This special property was used in GDevelop 4 IDE to ask for a Edit button to be shown, ignore it.

    if (field.valueType === 'boolean') {
      const { setValue } = field;
      const description = getFieldDescription(instances, field);

      return (
        <InlineCheckbox
          label={
            !description ? (
              getFieldLabel(instances, field)
            ) : (
              <React.Fragment>
                <Line noMargin>{getFieldLabel(instances, field)}</Line>
                <FormHelperText style={{ display: 'inline' }}>
                  <MarkdownText source={description} />
                </FormHelperText>
              </React.Fragment>
            )
          }
          key={field.name}
          checked={getFieldValue(instances, field)}
          onCheck={(event, newValue) => {
            instances.forEach(i => setValue(i, !!newValue));
            _onInstancesModified(instances);
          }}
          disabled={field.disabled}
        />
      );
    } else if (field.valueType === 'number') {
      const { setValue } = field;
      return (
        <SemiControlledTextField
          value={getFieldValue(instances, field)}
          key={field.name}
          id={field.name}
          floatingLabelText={getFieldLabel(instances, field)}
          floatingLabelFixed
          helperMarkdownText={getFieldDescription(instances, field)}
          onChange={newValue => {
            instances.forEach(i => setValue(i, parseFloat(newValue) || 0));
            _onInstancesModified(instances);
          }}
          type="number"
          style={styles.field}
          disabled={field.disabled}
        />
      );
    } else if (field.valueType === 'color') {
      const { setValue } = field;
      return (
        <ColorField
          key={field.name}
          id={field.name}
          floatingLabelText={getFieldLabel(instances, field)}
          helperMarkdownText={getFieldDescription(instances, field)}
          disableAlpha
          fullWidth
          color={getFieldValue(instances, field)}
          onChange={color => {
            const rgbString =
              color.length === 0 ? '' : rgbOrHexToRGBString(color);
            instances.forEach(i => setValue(i, rgbString));
            _onInstancesModified(instances);
          }}
        />
      );
    } else if (field.valueType === 'textarea') {
      const { setValue } = field;
      return (
        <SemiControlledTextField
          key={field.name}
          id={field.name}
          onChange={text => {
            instances.forEach(i => setValue(i, text || ''));
            _onInstancesModified(instances);
          }}
          value={getFieldValue(instances, field)}
          floatingLabelText={getFieldLabel(instances, field)}
          floatingLabelFixed
          helperMarkdownText={getFieldDescription(instances, field)}
          multiline
          style={styles.field}
        />
      );
    } else {
      const { onEditButtonClick, setValue } = field;
      return (
        <TextFieldWithButtonLayout
          key={field.name}
          renderTextField={() => (
            <SemiControlledTextField
              value={getFieldValue(instances, field, '(Multiple values)')}
              id={field.name}
              floatingLabelText={getFieldLabel(instances, field)}
              floatingLabelFixed
              helperMarkdownText={getFieldDescription(instances, field)}
              onChange={newValue => {
                instances.forEach(i => setValue(i, newValue || ''));
                _onInstancesModified(instances);
              }}
              style={styles.field}
              disabled={field.disabled}
            />
          )}
          renderButton={style =>
            onEditButtonClick ? (
              <RaisedButton
                style={style}
                primary
                disabled={instances.length !== 1}
                icon={<Edit />}
                label={<Trans>Edit</Trans>}
                onClick={() => onEditButtonClick(instances[0])}
              />
            ) : null
          }
        />
      );
    }
  };

  const renderSelectField = (field: ValueField) => {
    if (!field.getChoices || !field.getValue) return;

    const children = field
      .getChoices()
      .map(({ value, label }) => (
        <SelectOption key={value} value={value} primaryText={label} />
      ));

    if (field.valueType === 'number') {
      const { setValue } = field;
      return (
        <SelectField
          value={getFieldValue(instances, field)}
          key={field.name}
          floatingLabelText={getFieldLabel(instances, field)}
          helperMarkdownText={getFieldDescription(instances, field)}
          onChange={(event, index, newValue: string) => {
            instances.forEach(i => setValue(i, parseFloat(newValue) || 0));
            _onInstancesModified(instances);
          }}
          style={styles.field}
          disabled={field.disabled}
        >
          {children}
        </SelectField>
      );
    } else if (field.valueType === 'string') {
      const { setValue } = field;
      return (
        <SelectField
          value={getFieldValue(instances, field, '(Multiple values)')}
          key={field.name}
          floatingLabelText={getFieldLabel(instances, field)}
          helperMarkdownText={getFieldDescription(instances, field)}
          onChange={(event, index, newValue: string) => {
            instances.forEach(i => setValue(i, newValue || ''));
            _onInstancesModified(instances);
          }}
          style={styles.field}
          disabled={field.disabled}
        >
          {children}
        </SelectField>
      );
    }
  };

  const renderButton = (field: ValueField) => {
    //TODO: multi selection handling
    return (
      <FlatButton
        key={field.name}
        fullWidth
        primary
        label={getFieldLabel(instances, field)}
        onClick={() => {
          if (field.onClick) field.onClick(instances[0]);
        }}
      />
    );
  };

  const renderResourceField = (field: ResourceField) => {
    if (
      !project ||
      !resourceSources ||
      !onChooseResource ||
      !resourceExternalEditors
    ) {
      console.error(
        'You tried to display a resource field in a PropertiesEditor that does not support display resources. If you need to display resources, pass additional props (project, resourceSources, onChooseResource, resourceExternalEditors).'
      );
      return null;
    }

    const { setValue } = field;
    return (
      <ResourceSelector
        key={field.name}
        project={project}
        resourceSources={resourceSources}
        onChooseResource={onChooseResource}
        resourceExternalEditors={resourceExternalEditors}
        resourcesLoader={ResourcesLoader}
        resourceKind={field.resourceKind}
        fullWidth
        initialResourceName={getFieldValue(
          instances,
          field,
          '(Multiple values)' //TODO
        )}
        onChange={newValue => {
          instances.forEach(i => setValue(i, newValue));
          _onInstancesModified(instances);
        }}
        floatingLabelText={getFieldLabel(instances, field)}
        helperMarkdownText={getFieldDescription(instances, field)}
      />
    );
  };

  const renderContainer =
    mode === 'row'
      ? (fields: React.Node) => (
          <ResponsiveLineStackLayout noMargin>
            {fields}
          </ResponsiveLineStackLayout>
        )
      : (fields: React.Node) => (
          <ColumnStackLayout noMargin>{fields}</ColumnStackLayout>
        );

  return renderContainer(
    schema.map(field => {
      if (field.children) {
        if (field.type === 'row') {
          const contentView = (
            <UnsavedChangesContext.Consumer key={field.name}>
              {unsavedChanges => (
                <PropertiesEditor
                  project={project}
                  resourceSources={resourceSources}
                  onChooseResource={onChooseResource}
                  resourceExternalEditors={resourceExternalEditors}
                  schema={field.children}
                  instances={instances}
                  mode="row"
                  unsavedChanges={unsavedChanges}
                  onInstancesModified={onInstancesModified}
                />
              )}
            </UnsavedChangesContext.Consumer>
          );
          if (field.title) {
            return [
              <Text key={field.name + '-title'} size="title">
                {field.title}
              </Text>,
              contentView,
            ];
          }
          return contentView;
        }

        return (
          <div key={field.name}>
            <Subheader>{field.name}</Subheader>
            <div style={styles.subPropertiesEditorContainer}>
              <UnsavedChangesContext.Consumer key={field.name}>
                {unsavedChanges => (
                  <PropertiesEditor
                    project={project}
                    resourceSources={resourceSources}
                    onChooseResource={onChooseResource}
                    resourceExternalEditors={resourceExternalEditors}
                    schema={field.children}
                    instances={instances}
                    mode="column"
                    unsavedChanges={unsavedChanges}
                    onInstancesModified={onInstancesModified}
                  />
                )}
              </UnsavedChangesContext.Consumer>
            </div>
          </div>
        );
      } else if (field.valueType === 'resource') {
        return renderResourceField(field);
      } else {
        if (field.getChoices && field.getValue) return renderSelectField(field);
        if (field.getValue) return renderInputField(field);
        if (field.onClick) return renderButton(field);
      }

      return null;
    })
  );
};

export default PropertiesEditor;