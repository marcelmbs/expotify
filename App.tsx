import React, { useCallback, useRef } from "react";
import { Button, StyleSheet, Text, View, Animated, Image } from "react-native";
import Icon from 'react-native-vector-icons/Ionicons';
import { Audio } from "expo-av";
import * as luxon from "luxon";

export default function App() {
  let interval = useRef<NodeJS.Timeout | undefined>(undefined);
  const animacao = useRef(new Animated.Value(200)).current;

  const [musica, setMusica] = React.useState<Audio.Sound | undefined>(
    undefined
  );
  const [tempoMusica, setTempoMusica] = React.useState<number>(0);
  const [tempoAtualMusica, setTempoAtualMusica] = React.useState<number>(0);
  const [isPlaying, setIsPlaying] = React.useState(false);

  const subir = () => {
    Animated.timing(animacao, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const comecarMusica = useCallback(async () => {
    const { sound } = await Audio.Sound.createAsync(
      require("./assets/House.mp3")
    );

    interval.current = setInterval(() => {
      setTempoAtualMusica((previous) => previous + 1);
    }, 1000);

    setMusica(sound);
    sound.getStatusAsync().then((resultado: any) => {
      setTempoMusica(resultado.durationMillis);
    });

    await sound?.playAsync();
  }, [musica]);

  async function tocarMusica() {
    if (!musica) {
      comecarMusica();
      subir();
    } else {
      await musica?.playAsync();
    }
  }

  async function pararMusica() {
    await musica?.stopAsync();
    pararBarra();
  }

  async function descarregar() {
    musica?.unloadAsync();
    pararBarra();
  }

  function pararBarra() {
    if (!interval.current) return;
    clearInterval(interval.current);
    setTempoAtualMusica(0);
    setMusica(undefined);
    interval.current = undefined;
  }

  function calcularTempoEmPorcentagem() {
    if (tempoMusica) {
      return (
        (tempoAtualMusica /
          parseInt(
            luxon.DateTime.fromMillis(tempoMusica).toSeconds().toString(),
            10
          )) *
        100
      );
    }

    return 0;
  }

  return (
    <View style={styles.container}>
      <Image source={require('./assets/background.jpg')}
       style={{width: 300, height: 300}} />
       <Text>House Music.mp3</Text>
      <Icon name="caret-forward-circle-outline" size={30} color="#4F8EF7" onPress={tocarMusica} />
      <Animated.View
        style={[
          styles.informacoesContainer,
          { transform: [{ translateY: animacao }] },
        ]}
      >
        <View style={styles.conteudoInformacaoMusica}>
          <Text>
            {luxon.DateTime.fromSeconds(tempoAtualMusica).toFormat("mm:ss")} -
          </Text>
          <Text>
            {" "}
            {luxon.DateTime.fromMillis(tempoMusica).toFormat("mm:ss")}
          </Text>
        </View>
        <View style={styles.barraTempo}>
          <View
            style={[styles.dot, { left: `${calcularTempoEmPorcentagem()}%` }]}
          ></View>
          <View
            style={[
              styles.bar,
              { left: `${calcularTempoEmPorcentagem() - 98}%` },
            ]}
          ></View>
        </View>
        <View style={styles.botoes}>
        <Icon name="stop-circle-outline" size={30} color="#4F8EF7" onPress={pararMusica} />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  botoes: {
    flexDirection: "row",
    marginVertical: 30,
    justifyContent: "space-evenly",
    width: "100%",
  },
  informacoesContainer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    alignItems: "center",
  },
  conteudoInformacaoMusica: {
    flexDirection: "row",
    marginBottom: 20,
  },
  barraTempo: {
    borderBottomColor: "black",
    borderBottomWidth: 1,
    backgroundColor: "black",
    width: "100%",
    position: "relative",
  },
  dot: {
    width: 10,
    height: 10,
    backgroundColor: "black",
    top: -5,
    borderRadius: 1000,
    position: "absolute",
    zIndex: 50,
  },
  bar: {
    width: "100%",
    position: "absolute",
    backgroundColor: "green",
    height: 5,
    top: -2,
  },
});
