using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using UnityEngine.EventSystems;

[RequireComponent(typeof(Graphic))] // Works directly with UI Image or RawImage
public class HalftoneWavesController : MonoBehaviour, IPointerEnterHandler, IPointerExitHandler
{
    [System.Serializable]
    public struct Segment
    {
        public Vector2 start;
        public Vector2 end;
    }

    public class Wave
    {
        public List<Segment> segments = new List<Segment>();
        public float radius = 0f;
        public float speed = 110f;
        public float strength = 1.0f;
        public float startTime = 0f;
        public float? stopTime = null;
        public float lifetime = 2.4f; // 2.4 seconds (2400ms)
    }

    [Header("Shader Settings")]
    public float dotSpacing = 16f;
    [Range(0f, 1f)] public float idleOpacity = 0.15f;
    [Range(0f, 0.5f)] public float baseDotRadius = 0.10f;
    [Range(0f, 0.5f)] public float maxDotRadius = 0.28f;
    [Range(0.01f, 0.2f)] public float dotBlur = 0.08f;
    
    [Header("Physics Settings")]
    public float baseWaveSpeed = 110f;
    public float maxWaveSpeed = 380f;
    public float segmentSpawnDistance = 15f;
    public float segmentSpawnCooldown = 0.06f; // 60ms

    private Material material;
    private Graphic graphic;
    
    private Wave wave1; // Active or recently completed wave
    private Wave wave2; // Fading history wave

    private bool isMoving = false;
    private float lastMoveTime = 0f;
    private Vector2 lastMousePos = new Vector2(-9999f, -9999f);
    private float lastSpawnTime = 0f;

    private Vector2 mousePos = new Vector2(-9999f, -9999f);
    private Vector2 targetMousePos = new Vector2(-9999f, -9999f);

    private RectTransform rectTransform;
    private Canvas canvas;

    private Vector4[] w1Starts = new Vector4[8];
    private Vector4[] w1Ends = new Vector4[8];
    private Vector4[] w2Starts = new Vector4[8];
    private Vector4[] w2Ends = new Vector4[8];

    private void Awake()
    {
        graphic = GetComponent<Graphic>();
        rectTransform = GetComponent<RectTransform>();
        canvas = GetComponentInParent<Canvas>();

        // Duplicate material to avoid modifying the global asset on disk
        if (graphic != null)
        {
            if (graphic.material != null)
            {
                graphic.material = new Material(graphic.material);
                material = graphic.material;
            }
        }
    }

    private void OnDestroy()
    {
        if (material != null)
        {
            Destroy(material);
        }
    }

    public void OnPointerEnter(PointerEventData eventData)
    {
        UpdateMouseTargetPos(eventData);
    }

    public void OnPointerExit(PointerEventData eventData)
    {
        targetMousePos = new Vector2(-9999f, -9999f);
        lastMousePos = new Vector2(-9999f, -9999f);

        if (isMoving && wave1 != null)
        {
            if (wave1.segments.Count > 0)
            {
                wave1.stopTime = Time.time;
                wave2 = wave1;
            }
            wave1 = null;
        }
        isMoving = false;
    }

    private void UpdateMouseTargetPos(PointerEventData eventData)
    {
        if (rectTransform == null) return;

        Vector2 localPos;
        Camera cam = (canvas != null && canvas.renderMode == RenderMode.ScreenSpaceCamera) ? canvas.worldCamera : null;

        if (RectTransformUtility.ScreenPointToLocalPointInRectangle(rectTransform, eventData.position, cam, out localPos))
        {
            float w = rectTransform.rect.width;
            float h = rectTransform.rect.height;

            float x = localPos.x + w * rectTransform.pivot.x;
            float y = localPos.y + h * rectTransform.pivot.y;

            targetMousePos = new Vector2(x, y);
        }
    }

    private void Update()
    {
        float time = Time.time;

        if (targetMousePos.x > -9000f)
        {
            UpdateMouseFromInput();
        }

        UpdateWaves(time);
        UpdateMaterial(time);
    }

    private void UpdateMouseFromInput()
    {
        if (rectTransform == null) return;

        Vector2 mousePosScreen = Input.mousePosition;
        Vector2 localPos;
        Camera cam = (canvas != null && canvas.renderMode == RenderMode.ScreenSpaceCamera) ? canvas.worldCamera : null;

        if (RectTransformUtility.ScreenPointToLocalPointInRectangle(rectTransform, mousePosScreen, cam, out localPos))
        {
            float w = rectTransform.rect.width;
            float h = rectTransform.rect.height;

            float x = localPos.x + w * rectTransform.pivot.x;
            float y = localPos.y + h * rectTransform.pivot.y;

            targetMousePos = new Vector2(x, y);

            if (mousePos.x < -9000f)
            {
                mousePos = targetMousePos;
            }
            else
            {
                // Smooth interpolation (lerp) for organic static highlight movement
                mousePos.x += (targetMousePos.x - mousePos.x) * 0.08f;
                mousePos.y += (targetMousePos.y - mousePos.y) * 0.08f;
            }

            float now = Time.time;
            float dist = Vector2.Distance(targetMousePos, lastMousePos);

            // Cycle wave if resting or starting new stroke
            if (!isMoving || (now - lastMoveTime) > 0.12f)
            {
                isMoving = true;

                if (wave1 != null && wave1.segments.Count > 0)
                {
                    wave1.stopTime = now;
                    wave2 = wave1;
                }

                wave1 = new Wave
                {
                    startTime = now,
                    speed = baseWaveSpeed,
                    strength = 1f
                };

                lastMousePos = targetMousePos;
                lastSpawnTime = now;
            }

            // Add segment to active drag path
            if (dist > segmentSpawnDistance && (now - lastSpawnTime) > segmentSpawnCooldown)
            {
                if (wave1 != null)
                {
                    wave1.segments.Add(new Segment
                    {
                        start = lastMousePos,
                        end = targetMousePos
                    });

                    // Max 8 segments for shader arrays
                    if (wave1.segments.Count > 8)
                    {
                        wave1.segments.RemoveAt(0);
                    }

                    lastMousePos = targetMousePos;
                    lastSpawnTime = now;
                }
            }

            lastMoveTime = now;
        }
    }

    private void UpdateWaves(float time)
    {
        // 1. Rest state transition check (no movement for 120ms)
        if (isMoving && (time - lastMoveTime) > 0.12f)
        {
            isMoving = false;
            if (wave1 != null)
            {
                if (wave1.segments.Count > 0)
                {
                    wave1.stopTime = time;
                    wave2 = wave1;
                }
                wave1 = null;
            }
        }

        float dpr = 1f;

        // 2. Update Active Wave (Wave 1)
        if (wave1 != null)
        {
            float baseStrength = 1f;
            if (!isMoving && wave1.stopTime.HasValue)
            {
                float elapsed = time - wave1.stopTime.Value;
                baseStrength = Mathf.Max(0f, 1f - (elapsed / wave1.lifetime));
            }

            float proximity = 0f;
            if (baseStrength >= 0.22f && targetMousePos.x > -9000f && wave1.segments.Count > 0 && wave1.radius < 150f * dpr)
            {
                float minDist = 99999f;
                foreach (var seg in wave1.segments)
                {
                    Vector2 ba = seg.end - seg.start;
                    Vector2 pa = targetMousePos - seg.start;
                    float lenSq = ba.sqrMagnitude;
                    float h = lenSq > 0.0001f ? Mathf.Clamp01(Vector2.Dot(pa, ba) / lenSq) : 0f;
                    Vector2 pt = seg.start + ba * h;
                    float d = Vector2.Distance(targetMousePos, pt);
                    if (d < minDist) minDist = d;
                }

                float distToWaveFront = Mathf.Abs(minDist - wave1.radius);
                float x = distToWaveFront / (60f * dpr);
                proximity = x < 1f ? Mathf.Pow(1f - x * x, 2f) : 0f;
            }

            wave1.speed = baseWaveSpeed + proximity * (maxWaveSpeed - baseWaveSpeed);
            wave1.radius += wave1.speed * Time.deltaTime;
            wave1.strength = Mathf.Min(1f, baseStrength + proximity * 0.45f);

            // Expire check (only when stopped drawing)
            if (!isMoving && wave1.stopTime.HasValue && (time - wave1.stopTime.Value) > wave1.lifetime)
            {
                wave1 = null;
            }
        }

        // 3. Update Previous Wave (Wave 2)
        if (wave2 != null && wave2.stopTime.HasValue)
        {
            wave2.radius += wave2.speed * Time.deltaTime;
            float elapsed = time - wave2.stopTime.Value;
            wave2.strength = Mathf.Max(0f, 1f - (elapsed / wave2.lifetime));

            if (elapsed > wave2.lifetime)
            {
                wave2 = null;
            }
        }
    }

    private void UpdateMaterial(float time)
    {
        if (material == null || rectTransform == null) return;

        float w = rectTransform.rect.width;
        float h = rectTransform.rect.height;

        // Apply shader configurations
        material.SetFloat("_DotSpacing", dotSpacing);
        material.SetFloat("_IdleOpacity", idleOpacity);
        material.SetFloat("_BaseDotRadius", baseDotRadius);
        material.SetFloat("_MaxDotRadius", maxDotRadius);
        material.SetFloat("_DotBlur", dotBlur);

        // Bind core parameters
        material.SetVector("_Resolution", new Vector4(w, h, 0f, 0f));
        material.SetVector("_Mouse", targetMousePos.x > -9000f ? new Vector4(mousePos.x, mousePos.y, 0f, 0f) : new Vector4(-9999f, -9999f, 0f, 0f));
        material.SetFloat("_TimeGlobal", time);
        material.SetFloat("_DPR", 1f); // Can scale if high-res displays need larger shapes

        // Populate Wave 1 arrays
        int w1Count = 0;
        float w1Radius = 0f;
        float w1Strength = 0f;
        
        Array.Clear(w1Starts, 0, w1Starts.Length);
        Array.Clear(w1Ends, 0, w1Ends.Length);

        if (wave1 != null)
        {
            w1Count = Mathf.Min(wave1.segments.Count, 8);
            w1Radius = wave1.radius;
            w1Strength = wave1.strength;
            for (int i = 0; i < w1Count; i++)
            {
                w1Starts[i] = wave1.segments[i].start;
                w1Ends[i] = wave1.segments[i].end;
            }
        }

        material.SetVectorArray("_Wave1Starts", w1Starts);
        material.SetVectorArray("_Wave1Ends", w1Ends);
        material.SetInt("_Wave1Count", w1Count);
        material.SetFloat("_Wave1Radius", w1Radius);
        material.SetFloat("_Wave1Strength", w1Strength);

        // Populate Wave 2 arrays
        int w2Count = 0;
        float w2Radius = 0f;
        float w2Strength = 0f;

        Array.Clear(w2Starts, 0, w2Starts.Length);
        Array.Clear(w2Ends, 0, w2Ends.Length);

        if (wave2 != null)
        {
            w2Count = Mathf.Min(wave2.segments.Count, 8);
            w2Radius = wave2.radius;
            w2Strength = wave2.strength;
            for (int i = 0; i < w2Count; i++)
            {
                w2Starts[i] = wave2.segments[i].start;
                w2Ends[i] = wave2.segments[i].end;
            }
        }

        material.SetVectorArray("_Wave2Starts", w2Starts);
        material.SetVectorArray("_Wave2Ends", w2Ends);
        material.SetInt("_Wave2Count", w2Count);
        material.SetFloat("_Wave2Radius", w2Radius);
        material.SetFloat("_Wave2Strength", w2Strength);
    }
}
