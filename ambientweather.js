class AmbientWeather extends HTMLElement {
  constructor() {
    super();
  }

  addSection(title, text, className = '') {
    const header = document.createElement('div');
    header.classList.add('data-header');
    header.innerText = title;
    this.wrapper.append(header);

    const textEl = document.createElement('div');
    textEl.classList.add('data-text');
    className && textEl.classList.add(className);
    textEl.innerHTML = text;
    this.wrapper.append(textEl);
  }

  convertDegrees(degrees) {
    const sectors = [
      'N',
      'NNE',
      'NE',
      'ENE',
      'E',
      'ESE',
      'SE',
      'SSE',
      'S',
      'SSW',
      'SW',
      'WSW',
      'W',
      'WNW',
      'NW',
      'NNW',
      'N'
    ];
    return sectors[Math.round(degrees / 22.5)];
  }

  loadData() {
    const APPLICATION_KEY =
      '3ddf98f1649c4c0f9d2375a4ddb65a098f51e77d3ce34d1ca464cae774c031ae';
    const url = new URL('https://rt.ambientweather.net/v1/devices/');
    url.searchParams.append('apiKey', this.apikey);
    url.searchParams.append('applicationKey', APPLICATION_KEY);

    fetch(url)
      .then((response) => response.json())
      .then((result) => {
        const data = result[0].lastData;

        this.wrapper.querySelector('.loading').remove();

        this.addSection('temperature', data.tempf + '&deg; F');
        this.addSection(
          'wind',
          this.convertDegrees(data.winddir) + ' ' + data.windspeedmph + 'mph'
        );

        if (data.hourlyrainin) {
          this.addSection(
            'the current rain rate',
            data.hourlyrainin + ' inches/hour'
          );
        } else {
          const raindate = new Date(data.lastRain);
          const [month, day, hour, minute] = [
            raindate.getMonth() + 1,
            raindate.getDate(),
            raindate.getHours(),
            raindate.getMinutes() + ''
          ];

          this.addSection(
            'the last time it rained',
            `${month}/${day} ${hour}:${minute.padStart(2, '0')}`
          );
        }
      })
      .catch((err) => {
        console.log('aw error:', err);
        this.addSection('error', 'Something went wrong');
      });
  }

  connectedCallback() {
    this.attachShadow({ mode: 'open' });

    this.wrapper = document.createElement('wrapper');
    this.wrapper.setAttribute('class', 'wrapper');

    const style = document.createElement('style');
    style.textContent = `
      .data-header {
        font-size: var(--header-font-size, 1.2em);
        font-stretch: var(--header-font-stretch, 125%);
        font-weight: var(--header-font-weight, 500);
        color: var(--header-color, #000000);
      }

      .data-text {
        font-size: var(--data-font-size, 2em);
        font-stretch: var(--data-font-stretch, 95%);
        font-weight: var(--data-font-weight, 700);
        color: var(--data-color, #000000);
        margin-bottom: 0.5em;
      }
    `;

    this.shadowRoot.append(style, this.wrapper);

    if (this.hasAttribute('api-key')) {
      this.apikey = this.getAttribute('api-key');

      const loading = document.createElement('div');
      loading.classList.add('loading');
      loading.innerText = 'Loading...';
      this.wrapper.append(loading);

      this.loadData();
    } else {
      this.addSection('error', 'No API key');
    }
  }
}

customElements.define('ambient-weather', AmbientWeather);
