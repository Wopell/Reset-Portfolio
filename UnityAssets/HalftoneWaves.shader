Shader "Custom/HalftoneWaves"
{
    Properties
    {
        _MainTex ("Texture", 2D) = "white" {}
        _DotSpacing ("Dot Spacing", Float) = 16.0
        _IdleOpacity ("Idle Opacity", Range(0, 1)) = 0.15
        _BaseDotRadius ("Base Dot Radius", Range(0, 0.5)) = 0.10
        _MaxDotRadius ("Max Dot Radius", Range(0, 0.5)) = 0.28
        _DotBlur ("Dot Blur/Antialias", Range(0.01, 0.2)) = 0.08
    }
    SubShader
    {
        Tags 
        { 
            "Queue"="Transparent" 
            "IgnoreProjector"="True" 
            "RenderType"="Transparent" 
            "PreviewType"="Plane"
        }
        LOD 100
        Blend SrcAlpha OneMinusSrcAlpha
        ZWrite Off
        Cull Off

        Pass
        {
            CGPROGRAM
            #pragma vertex vert
            #pragma fragment frag
            #include "UnityCG.cginc"

            struct appdata
            {
                float4 vertex : POSITION;
                float2 uv : TEXCOORD0;
            };

            struct v2f
            {
                float2 uv : TEXCOORD0;
                float4 vertex : SV_POSITION;
            };

            sampler2D _MainTex;
            float4 _MainTex_ST;
            
            float _DotSpacing;
            float _IdleOpacity;
            float _BaseDotRadius;
            float _MaxDotRadius;
            float _DotBlur;

            // Uniforms set by controller script
            float2 _Resolution;
            float2 _Mouse; // Mouse position in pixels from bottom-left (or negative if offscreen)
            float _TimeGlobal;
            float _DPR;

            // Wave 1 Uniforms (Active Drag Path - Max 8 segments)
            float4 _Wave1Starts[8];
            float4 _Wave1Ends[8];
            int _Wave1Count;
            float _Wave1Radius;
            float _Wave1Strength;

            // Wave 2 Uniforms (Historical Drag Path - Max 8 segments)
            float4 _Wave2Starts[8];
            float4 _Wave2Ends[8];
            int _Wave2Count;
            float _Wave2Radius;
            float _Wave2Strength;

            v2f vert (appdata v)
            {
                v2f o;
                o.vertex = UnityObjectToClipPos(v.vertex);
                o.uv = v.uv;
                return o;
            }

            // Simple 2D hash for noise
            float hash(float2 p)
            {
                return fract(sin(dot(p, float2(127.1, 311.7))) * 43758.5453123);
            }

            // 2D Value Noise
            float noise(float2 p)
            {
                float2 i = floor(p);
                float2 f = fract(p);
                float2 u = f * f * (3.0 - 2.0 * f);
                return mix(mix(hash(i + float2(0.0, 0.0)), hash(i + float2(1.0, 0.0)), u.x),
                           mix(hash(i + float2(0.0, 1.0)), hash(i + float2(1.0, 1.0)), u.x), u.y);
            }

            // Evolving Fractal Brownian Motion (layered noise with time-phase morphing)
            float fbm(float2 p, float time)
            {
                float value = 0.0;
                float amplitude = 0.5;
                float frequency = 1.0;
                
                // Octave 1
                value += amplitude * noise(p * frequency + float2(0.0, -time * 0.8));
                
                // Octave 2
                amplitude *= 0.5;
                frequency *= 2.0;
                value += amplitude * noise(p * frequency + float2(-time * 0.5, time * 0.7));
                
                // Octave 3
                amplitude *= 0.5;
                frequency *= 2.0;
                value += amplitude * noise(p * frequency + float2(time * 0.9, -time * 0.4));
                
                return value;
            }

            fixed4 frag (v2f i) : SV_Target
            {
                // Convert UV [0,1] to pixel coordinates [0, width/height]
                float2 pixelCoords = i.uv * _Resolution;
                float dotSpacing = _DotSpacing * _DPR;

                float2 gridUv = fract(pixelCoords / dotSpacing) - 0.5;
                float2 cellId = floor(pixelCoords / dotSpacing);
                float2 cellCenterPixels = (cellId + 0.5) * dotSpacing;

                // 1. Concentrated Static Hover (where the mouse rests)
                // If mouse position is negative (e.g. -9999), it is offscreen
                float isMouseValid = (_Mouse.x > -9000.0) ? 1.0 : 0.0;
                float staticDist = distance(cellCenterPixels, _Mouse);
                float staticRadius = 65.0 * _DPR;

                // Negative Bulge (Attraction/Pinch) effect: pull dot centers towards the cursor
                float2 pullDir = normalize(_Mouse - cellCenterPixels);
                float pullStrength = smoothstep(staticRadius, 0.0, staticDist) * 7.5 * _DPR * isMouseValid;

                float2 pulledCenter = cellCenterPixels;
                if (staticDist > 0.1)
                {
                    pulledCenter += pullDir * pullStrength;
                }

                // Re-calculate gridUV based on pulled centers
                float2 pulledGridUv = (pixelCoords - pulledCenter) / dotSpacing;

                // Swell of the dots (grow slightly larger, keeping them elegant)
                float staticSwell = smoothstep(staticRadius, 0.0, staticDist) * 0.06 * isMouseValid;
                float staticOpacity = smoothstep(staticRadius, 0.0, staticDist) * isMouseValid;

                // 2. Dynamic Expanding Waves (Wavy, asymmetric, and cursor-repelled)
                // --- WAVE 1: Active Drag Path (up to 8 segments) ---
                float wave1Intensity = 0.0;
                float2 warp1 = float2(0.0, 0.0);

                if (_Wave1Count > 0 && _Wave1Strength > 0.01)
                {
                    float minDist1 = 99999.0;
                    float2 closestPoint1 = float2(0.0, 0.0);
                    float2 closestSegStart1 = float2(0.0, 0.0);
                    float2 closestSegEnd1 = float2(0.0, 0.0);

                    for (int s = 0; s < 8; s++)
                    {
                        if (s >= _Wave1Count) break;
                        float2 start = _Wave1Starts[s].xy;
                        float2 end = _Wave1Ends[s].xy;
                        
                        float2 ba = end - start;
                        float2 pa = cellCenterPixels - start;
                        float lenSq = dot(ba, ba);
                        float h = lenSq > 0.0001 ? clamp(dot(pa, ba) / lenSq, 0.0, 1.0) : 0.0;
                        float2 pt = start + ba * h;
                        float d = length(cellCenterPixels - pt);
                        
                        if (d < minDist1)
                        {
                            minDist1 = d;
                            closestPoint1 = pt;
                            closestSegStart1 = start;
                            closestSegEnd1 = end;
                        }
                    }

                    float2 ba1 = closestSegEnd1 - closestSegStart1;
                    float segLen1 = length(ba1);
                    float2 velDir1 = segLen1 > 0.1 ? ba1 / segLen1 : float2(0.0, 0.0);

                    float2 toCell1 = cellCenterPixels - closestPoint1;
                    float2 dirNorm1 = minDist1 > 0.1 ? toCell1 / minDist1 : float2(0.0, 0.0);
                    float proj1 = dot(dirNorm1, velDir1);

                    float waveNoise1 = fbm(cellId * 0.045, _TimeGlobal * 0.6);
                    float radiusOffset1 = (waveNoise1 - 0.5) * 45.0 * _DPR;

                    float waveDist1 = abs(minDist1 - (_Wave1Radius + radiusOffset1));
                    float maxWaveWidth = 35.0 * _DPR;
                    float waveWidth = min(maxWaveWidth, _Wave1Radius * 0.8 + 6.0 * _DPR);

                    float x1 = clamp(waveDist1 / waveWidth, 0.0, 1.0);
                    float waveIntensityFactor1 = 1.0 - x1 * x1;
                    waveIntensityFactor1 = waveIntensityFactor1 * waveIntensityFactor1 * waveIntensityFactor1;

                    float directionScale1 = smoothstep(-0.3, 0.3, proj1) * 0.93 + 0.07;

                    wave1Intensity = waveIntensityFactor1 * _Wave1Strength * directionScale1;
                    wave1Intensity *= smoothstep(0.0, 45.0 * _DPR, minDist1); // fade center of the path

                    if (minDist1 > 0.1)
                    {
                        float2 warpDir = normalize(toCell1);
                        float waveOsc = sin(minDist1 * 0.08 - _Wave1Radius * 0.15);
                        warp1 = warpDir * waveOsc * wave1Intensity * 1.5 * _DPR;
                    }
                }

                // --- WAVE 2: Historical Drag Path 1 (Fading out organically) ---
                float wave2Intensity = 0.0;
                float2 warp2 = float2(0.0, 0.0);

                if (_Wave2Count > 0 && _Wave2Strength > 0.01)
                {
                    float minDist2 = 99999.0;
                    float2 closestPoint2 = float2(0.0, 0.0);
                    float2 closestSegStart2 = float2(0.0, 0.0);
                    float2 closestSegEnd2 = float2(0.0, 0.0);

                    for (int s = 0; s < 8; s++)
                    {
                        if (s >= _Wave2Count) break;
                        float2 start = _Wave2Starts[s].xy;
                        float2 end = _Wave2Ends[s].xy;
                        
                        float2 ba = end - start;
                        float2 pa = cellCenterPixels - start;
                        float lenSq = dot(ba, ba);
                        float h = lenSq > 0.0001 ? clamp(dot(pa, ba) / lenSq, 0.0, 1.0) : 0.0;
                        float2 pt = start + ba * h;
                        float d = length(cellCenterPixels - pt);
                        
                        if (d < minDist2)
                        {
                            minDist2 = d;
                            closestPoint2 = pt;
                            closestSegStart2 = start;
                            closestSegEnd2 = end;
                        }
                    }

                    float2 ba2 = closestSegEnd2 - closestSegStart2;
                    float segLen2 = length(ba2);
                    float2 velDir2 = segLen2 > 0.1 ? ba2 / segLen2 : float2(0.0, 0.0);

                    float2 toCell2 = cellCenterPixels - closestPoint2;
                    float2 dirNorm2 = minDist2 > 0.1 ? toCell2 / minDist2 : float2(0.0, 0.0);
                    float proj2 = dot(dirNorm2, velDir2);

                    float waveNoise2 = fbm(cellId * 0.045, _TimeGlobal * 0.6);
                    float radiusOffset2 = (waveNoise2 - 0.5) * 45.0 * _DPR;

                    float waveDist2 = abs(minDist2 - (_Wave2Radius + radiusOffset2));
                    float maxWaveWidth2 = 35.0 * _DPR;
                    float waveWidth2 = min(maxWaveWidth2, _Wave2Radius * 0.8 + 6.0 * _DPR);

                    float x2 = clamp(waveDist2 / waveWidth2, 0.0, 1.0);
                    float waveIntensityFactor2 = 1.0 - x2 * x2;
                    waveIntensityFactor2 = waveIntensityFactor2 * waveIntensityFactor2 * waveIntensityFactor2;

                    float directionScale2 = smoothstep(-0.3, 0.3, proj2) * 0.93 + 0.07;

                    wave2Intensity = waveIntensityFactor2 * _Wave2Strength * directionScale2;
                    wave2Intensity *= smoothstep(0.0, 45.0 * _DPR, minDist2); // fade center

                    if (minDist2 > 0.1)
                    {
                        float2 warpDir = normalize(toCell2);
                        float waveOsc = sin(minDist2 * 0.08 - _Wave2Radius * 0.15);
                        warp2 = warpDir * waveOsc * wave2Intensity * 1.5 * _DPR;
                    }
                }

                // Combine all waves (Wave 1, Wave 2)
                float totalWave = max(wave1Intensity, wave2Intensity);
                float2 totalWarp = warp1 + warp2;

                // Apply noise coords distorted by water refraction warp
                float2 noiseCoords = cellId * 0.07 - totalWarp * 0.2;
                float noiseVal = fbm(noiseCoords, _TimeGlobal);

                // Combined Swell: static hover swell takes precedence, dynamic wave swell overlays
                float swell = max(staticSwell, totalWave * 0.10);
                
                // Final radius
                float dotRadius = clamp(noiseVal * 0.30 + swell, 0.01, _MaxDotRadius);

                // Draw dot shape with antialiased borders using the pulled centers
                float distToCenter = length(pulledGridUv);
                float dotColor = smoothstep(dotRadius, dotRadius - _DotBlur, distToCenter);

                // Combined Opacity: static hover and dynamic waves light up to 100%, idle background stays at _IdleOpacity
                float totalOpacityFactor = max(staticOpacity, totalWave);
                float finalOpacity = mix(_IdleOpacity, 1.0, totalOpacityFactor);

                // Output black halftone dots with dynamic alpha (color matches dark dots)
                return fixed4(0.0, 0.0, 0.0, dotColor * finalOpacity);
            }
            ENDCG
        }
    }
}
