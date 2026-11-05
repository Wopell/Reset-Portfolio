# Implementación de Olas Halftone en Unity (Estilo Sección Blanca)

Este directorio contiene los archivos necesarios para imitar el efecto interactivo de olas halftone reactivas de la sección blanca de tu sitio web dentro de Unity.

## Archivos Incluidos
1. **[HalftoneWaves.shader](file:///d:/DaVinci/TUTORIA/Reset%20web/00_versiones/reset-studio-portfolio_6-7/UnityAssets/HalftoneWaves.shader)**: Un shader personalizado en HLSL compatible con Unity (Built-in Pipeline) que dibuja los puntos halftone deformados por el cursor (atracción) y genera las ondas fluidas y asimétricas (ruido FBM + propagación de onda).
2. **[HalftoneWavesController.cs](file:///d:/DaVinci/TUTORIA/Reset%20web/00_versiones/reset-studio-portfolio_6-7/UnityAssets/HalftoneWavesController.cs)**: Script de C# para Unity que rastrea la posición del cursor sobre el RectTransform, calcula el trazado del movimiento en segmentos y pasa los datos de las olas y coordenadas de forma continua al shader.

---

## Cómo Configurar en Unity (Paso a Paso)

### 1. Importar los Archivos
- Copia los archivos `HalftoneWaves.shader` y `HalftoneWavesController.cs` dentro de la carpeta `Assets/` de tu proyecto de Unity.

### 2. Crear el Material
- En la ventana *Project* de Unity, haz clic derecho sobre `HalftoneWaves.shader` y selecciona **Create > Material**.
- Esto creará un material pre-configurado llamado `HalftoneWaves` que utiliza el shader `Custom/HalftoneWaves`.

### 3. Configurar la Interfaz de Usuario (UI)
El script de C# está optimizado para funcionar directamente sobre elementos de UI con eventos del puntero:
1. En tu Escena, crea un Canvas de UI si no tienes uno.
2. Crea un objeto **RawImage** dentro del Canvas (**GameObject > UI > Raw Image**).
3. Ajusta el tamaño de la `RawImage` para cubrir el área donde deseas ver el fondo de olas.
4. En el componente `Raw Image`, asigna el material `HalftoneWaves` que creaste en el paso 2 en la propiedad **Material**.
5. Añade el script **HalftoneWavesController** como componente al objeto `RawImage`.

### 4. Asegurar que los Eventos Funcionen
- El Canvas de UI debe tener un componente **Graphic Raycaster** y el objeto `RawImage` debe tener activada la opción **Raycast Target** para que detecte el movimiento y entrada del mouse.
- Asegúrate de tener un **EventSystem** en la escena (**GameObject > UI > Event System**).

### 5. Probar el Efecto
- ¡Dale a **Play** en Unity!
- Al mover el puntero sobre la `RawImage`, verás cómo los puntos se curvan atrayéndose hacia tu cursor (atracción estática).
- Si arrastras el mouse rápidamente, verás las ondas expandiéndose con el característico efecto de difracción del agua y la rugosidad orgánica generada por el ruido fractal del shader.

---

## Parámetros Personalizables en el Material
Puedes ajustar los siguientes valores desde el inspector del material para adaptar el estilo visual:
* **Dot Spacing** (Espaciado): Controla la densidad de la cuadrícula de puntos.
* **Idle Opacity** (Opacidad en reposo): Transparencia del fondo cuando no hay interacción (por defecto `0.15` para que sea sutil).
* **Base Dot Radius** (Radio base): Tamaño inicial de los círculos.
* **Max Dot Radius** (Radio máximo): Límite de crecimiento de los puntos al ser distorsionados o al pasar la onda.
* **Dot Blur/Antialias** (Suavizado): Qué tan difuminados u nítidos se ven los bordes de los círculos.

¡Disfruta implementándolo en tus proyectos! Si necesitas realizar alguna adaptación o tienes dudas sobre cómo portarlo a URP/HDRP, no dudes en preguntar.
