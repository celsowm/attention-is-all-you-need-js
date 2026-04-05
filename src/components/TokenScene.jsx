import { Card, CardContent, Typography } from '@mui/material';
import { Billboard, Float, OrbitControls, Text } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { useMemo } from 'react';
import * as THREE from 'three';
import { useI18n } from '../i18n/I18nProvider';

function tokenPosition(index, total, active) {
  const angle = (index / Math.max(total, 1)) * Math.PI * 2;
  const radius = active ? 2.9 : 2.25;
  return new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * 1.1, Math.sin(angle) * radius * 0.8);
}

function TokenOrb({ label, index, total, active }) {
  const position = useMemo(() => tokenPosition(index, total, active), [index, total, active]);

  return (
    <Float speed={1.4 + index * 0.08} rotationIntensity={0.25} floatIntensity={0.7}>
      <mesh position={position}>
        <sphereGeometry args={[active ? 0.34 : 0.24, 32, 32]} />
        <meshStandardMaterial color={active ? '#7c4dff' : '#26c6da'} emissive={active ? '#7c4dff' : '#1a3c66'} emissiveIntensity={0.9} />
      </mesh>
      <Billboard position={[position.x, position.y + 0.5, position.z]} follow>
        <Text color="white" fontSize={0.22} anchorX="center" anchorY="middle">
          {label}
        </Text>
      </Billboard>
    </Float>
  );
}

function AttentionLinks({ tokensCount, focusIndex, attention }) {
  const { geometry, material } = useMemo(() => {
    if (!attention?.length || focusIndex == null) return { geometry: null, material: null };
    const focusPos = tokenPosition(focusIndex, tokensCount, true);
    const points = [];

    for (const a of attention) {
      const w = Number(a.weight ?? 0);
      if (!Number.isFinite(w) || w <= 0.01) continue;
      const srcPos = tokenPosition(a.sourceIndex, tokensCount, false);
      points.push(focusPos.clone(), srcPos);
    }

    if (!points.length) return { geometry: null, material: null };
    return {
      geometry: new THREE.BufferGeometry().setFromPoints(points),
      material: new THREE.LineBasicMaterial({ color: 0xffca28, transparent: true, opacity: 0.45 }),
    };
  }, [attention, focusIndex, tokensCount]);

  if (!geometry || !material) return null;
  return <lineSegments geometry={geometry} material={material} />;
}

export default function TokenScene({ tokens, tokensDisplay, focusIndex, attention }) {
  const { t } = useI18n();
  const labels = tokensDisplay?.length ? tokensDisplay : tokens;
  const activeIndex = focusIndex ?? Math.max(0, (tokens?.length || 1) - 1);

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flex: 1, p: 2.5, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <Typography variant="h6" sx={{ mb: 1.5 }}>{t('scene.title')}</Typography>
        <Canvas camera={{ position: [0, 0, 7], fov: 52 }} style={{ background: '#020617', borderRadius: 12 }}>
          <ambientLight intensity={1.35} />
          <pointLight position={[4, 4, 4]} intensity={18} />
          <AttentionLinks tokensCount={labels.length} focusIndex={activeIndex} attention={attention} />
          {labels.map((token, index) => <TokenOrb key={`${token}-${index}`} label={token} index={index} total={labels.length} active={index === activeIndex} />)}
          <OrbitControls enablePan={false} />
        </Canvas>
      </CardContent>
    </Card>
  );
}
