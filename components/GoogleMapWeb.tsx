import React, { useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';


interface Location {
  latitude: number;
  longitude: number;
  address: string;
}

interface GooglePlacesWebViewProps {
  onLocationSelect: (location: Location) => void;
}

const GooglePlacesWebView: React.FC<GooglePlacesWebViewProps> = ({ onLocationSelect }) => {
  const webViewRef = useRef(null);

  const handleMessage = (event: { nativeEvent: { data: string; }; }) => {
    const location = JSON.parse(event.nativeEvent.data);
    onLocationSelect(location);
  };

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Google Places Autocomplete</title>
      <script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyB-rQCIb2SGbdoYBeFCwbDaBOGufk9ZgmQ&libraries=places"></script>
      <script>
        function initAutocomplete() {
          const input = document.getElementById('autocomplete');
          const autocomplete = new google.maps.places.Autocomplete(input);
          autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            const location = {
              latitude: place.geometry.location.lat(),
              longitude: place.geometry.location.lng(),
              address: place.formatted_address,
            };
            window.ReactNativeWebView.postMessage(JSON.stringify(location));
          });
        }
        window.onload = initAutocomplete;
      </script>
    </head>
    <body>
      <input id="autocomplete" type="text" placeholder="Enter a location" style="width: 100%; padding: 10px; font-size: 16px;" />
    </body>
    </html>
  `;

  return (
    <WebView
      ref={webViewRef}
      originWhitelist={['*']}
      source={{ html: htmlContent }}
      onMessage={handleMessage}
      style={styles.webView}
    />
  );
};

const styles = StyleSheet.create({
  webView: {
    flex: 1,
    height: 50,
  },
});

export default GooglePlacesWebView;