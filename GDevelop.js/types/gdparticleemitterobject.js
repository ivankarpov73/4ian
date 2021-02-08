// Automatically generated by GDevelop.js/scripts/generate-types.js
declare class gdParticleEmitterObject extends gdObject {
  constructor(name: string): void;
  setRendererType(type: ParticleEmitterObject_RendererType): void;
  getRendererType(): ParticleEmitterObject_RendererType;
  setParticleTexture(resourceName: string): void;
  getParticleTexture(): string;
  setRendererParam1(newValue: number): void;
  getRendererParam1(): number;
  setRendererParam2(newValue: number): void;
  getRendererParam2(): number;
  isRenderingAdditive(): boolean;
  setRenderingAdditive(): void;
  setRenderingAlpha(): void;
  getNbParticles(): number;
  setMaxParticleNb(newValue: number): void;
  getMaxParticleNb(): number;
  setTank(newValue: number): void;
  getTank(): number;
  setFlow(newValue: number): void;
  getFlow(): number;
  setDestroyWhenNoParticles(enable: boolean): void;
  getDestroyWhenNoParticles(): boolean;
  setEmitterForceMin(newValue: number): void;
  getEmitterForceMin(): number;
  setEmitterForceMax(newValue: number): void;
  getEmitterForceMax(): number;
  setConeSprayAngle(newValue: number): void;
  getConeSprayAngle(): number;
  setZoneRadius(newValue: number): void;
  getZoneRadius(): number;
  setParticleGravityX(newValue: number): void;
  getParticleGravityX(): number;
  setParticleGravityY(newValue: number): void;
  getParticleGravityY(): number;
  setParticleGravityZ(newValue: number): void;
  getParticleGravityZ(): number;
  setParticleGravityAngle(newValue: number): void;
  getParticleGravityAngle(): number;
  setParticleGravityLength(newValue: number): void;
  getParticleGravityLength(): number;
  setFriction(newValue: number): void;
  getFriction(): number;
  setParticleLifeTimeMin(newValue: number): void;
  getParticleLifeTimeMin(): number;
  setParticleLifeTimeMax(newValue: number): void;
  getParticleLifeTimeMax(): number;
  setParticleRed1(newValue: number): void;
  getParticleRed1(): number;
  setParticleRed2(newValue: number): void;
  getParticleRed2(): number;
  setParticleGreen1(newValue: number): void;
  getParticleGreen1(): number;
  setParticleGreen2(newValue: number): void;
  getParticleGreen2(): number;
  setParticleBlue1(newValue: number): void;
  getParticleBlue1(): number;
  setParticleBlue2(newValue: number): void;
  getParticleBlue2(): number;
  setParticleAlpha1(newValue: number): void;
  getParticleAlpha1(): number;
  setParticleAlpha2(newValue: number): void;
  getParticleAlpha2(): number;
  setParticleSize1(newValue: number): void;
  getParticleSize1(): number;
  setParticleSize2(newValue: number): void;
  getParticleSize2(): number;
  setParticleAngle1(newValue: number): void;
  getParticleAngle1(): number;
  setParticleAngle2(newValue: number): void;
  getParticleAngle2(): number;
  setParticleAlphaRandomness1(newValue: number): void;
  getParticleAlphaRandomness1(): number;
  setParticleAlphaRandomness2(newValue: number): void;
  getParticleAlphaRandomness2(): number;
  setParticleSizeRandomness1(newValue: number): void;
  getParticleSizeRandomness1(): number;
  setParticleSizeRandomness2(newValue: number): void;
  getParticleSizeRandomness2(): number;
  setParticleAngleRandomness1(newValue: number): void;
  getParticleAngleRandomness1(): number;
  setParticleAngleRandomness2(newValue: number): void;
  getParticleAngleRandomness2(): number;
  delete(): void;
  ptr: number;
};