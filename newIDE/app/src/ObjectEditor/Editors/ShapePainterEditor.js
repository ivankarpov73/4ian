// @flow
import { t, Trans } from '@lingui/macro';

import * as React from 'react';
import Checkbox from '../../UI/Checkbox';
import ColorField from '../../UI/ColorField';
import {
  rgbColorToRGBString,
  rgbStringAndAlphaToRGBColor,
} from '../../Utils/ColorTransformer';
import { type EditorProps } from './EditorProps.flow';
import SemiControlledTextField from '../../UI/SemiControlledTextField';
import { ResponsiveLineStackLayout, ColumnStackLayout } from '../../UI/Layout';
import Text from '../../UI/Text';
import SelectField from '../../UI/SelectField';
import SelectOption from '../../UI/SelectOption';
const gd = global.gd;

export default class PanelSpriteEditor extends React.Component<
  EditorProps,
  void
> {
  render() {
    const { objectConfiguration } = this.props;
    const shapePainterConfiguration = gd.asShapePainterConfiguration(
      objectConfiguration
    );

    return (
      <ColumnStackLayout noMargin>
        <Checkbox
          label={
            <Trans>
              Draw the shapes relative to the object position on the scene
            </Trans>
          }
          checked={!shapePainterConfiguration.areCoordinatesAbsolute()}
          onCheck={(e, checked) => {
            if (!checked) shapePainterConfiguration.setCoordinatesAbsolute();
            else shapePainterConfiguration.setCoordinatesRelative();
            this.forceUpdate();
          }}
        />
        <Checkbox
          label={<Trans>Clear the rendered image between each frame</Trans>}
          checked={shapePainterConfiguration.isClearedBetweenFrames()}
          onCheck={(e, checked) => {
            shapePainterConfiguration.setClearBetweenFrames(checked);
            this.forceUpdate();
          }}
        />
        <ResponsiveLineStackLayout noMargin>
          <ColorField
            floatingLabelText={<Trans>Outline color</Trans>}
            disableAlpha
            fullWidth
            color={rgbColorToRGBString({
              r: shapePainterConfiguration.getOutlineColorR(),
              g: shapePainterConfiguration.getOutlineColorG(),
              b: shapePainterConfiguration.getOutlineColorB(),
            })}
            onChange={color => {
              const rgbColor = rgbStringAndAlphaToRGBColor(color);
              if (rgbColor) {
                shapePainterConfiguration.setOutlineColor(
                  rgbColor.r,
                  rgbColor.g,
                  rgbColor.b
                );

                this.forceUpdate();
              }
            }}
          />
          <SemiControlledTextField
            commitOnBlur
            floatingLabelText={<Trans>Outline opacity (0-255)</Trans>}
            fullWidth
            type="number"
            value={shapePainterConfiguration.getOutlineOpacity()}
            onChange={value => {
              shapePainterConfiguration.setOutlineOpacity(
                parseInt(value, 10) || 0
              );
              this.forceUpdate();
            }}
          />
          <SemiControlledTextField
            commitOnBlur
            floatingLabelText={<Trans>Outline size (in pixels)</Trans>}
            fullWidth
            type="number"
            value={shapePainterConfiguration.getOutlineSize()}
            onChange={value => {
              shapePainterConfiguration.setOutlineSize(
                parseInt(value, 10) || 0
              );
              this.forceUpdate();
            }}
          />
        </ResponsiveLineStackLayout>
        <ResponsiveLineStackLayout noMargin>
          <ColorField
            floatingLabelText={<Trans>Fill color</Trans>}
            disableAlpha
            fullWidth
            color={rgbColorToRGBString({
              r: shapePainterConfiguration.getFillColorR(),
              g: shapePainterConfiguration.getFillColorG(),
              b: shapePainterConfiguration.getFillColorB(),
            })}
            onChange={color => {
              const rgbColor = rgbStringAndAlphaToRGBColor(color);
              if (rgbColor) {
                shapePainterConfiguration.setFillColor(
                  rgbColor.r,
                  rgbColor.g,
                  rgbColor.b
                );

                this.forceUpdate();
              }
            }}
          />
          <SemiControlledTextField
            commitOnBlur
            floatingLabelText={<Trans>Fill opacity (0-255)</Trans>}
            fullWidth
            type="number"
            value={shapePainterConfiguration.getFillOpacity()}
            onChange={value => {
              shapePainterConfiguration.setFillOpacity(
                parseInt(value, 10) || 0
              );
              this.forceUpdate();
            }}
          />
        </ResponsiveLineStackLayout>
        <ResponsiveLineStackLayout alignItems="center" noMargin>
          <Text>
            <Trans>Anti-aliasing:</Trans>
          </Text>
          <SelectField
            value={shapePainterConfiguration.getAntialiasing()}
            onChange={(e, i, valueString: string) => {
              shapePainterConfiguration.setAntialiasing(valueString);
              this.forceUpdate();
            }}
          >
            <SelectOption
              key="none"
              value="None"
              primaryText={t`No anti-aliasing`}
            />
            <SelectOption
              key="low"
              value="Low"
              primaryText={t`Low quality anti-aliasing`}
            />
            <SelectOption
              key="medium"
              value="Medium"
              primaryText={t`Medium quality anti-aliasing`}
            />
            <SelectOption
              key="high"
              value="High"
              primaryText={t`High quality anti-aliasing`}
            />
          </SelectField>
        </ResponsiveLineStackLayout>
      </ColumnStackLayout>
    );
  }
}
