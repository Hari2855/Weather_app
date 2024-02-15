import React, { useCallback, useEffect, useState } from "react";
import { Image, SafeAreaView, ScrollView, StatusBar, Text, TextInput, TouchableOpacity, View } from "react-native";
import { tw } from "react-native-tailwindcss";
import { theme } from "../theme";
import { MagnifyingGlassIcon } from 'react-native-heroicons/outline'
import { CalendarIcon, MapPinIcon } from 'react-native-heroicons/solid'
import { debounce } from "lodash";
import { fetchLocations, fetchWeatherForecast } from "../api/weather";
import { weatherImages } from "../contants";
import * as Progress from 'react-native-progress';
import { getData, storeData } from "../utils/asyncStorage";


export default function HomeScreen() {
    const [showSearch, toggleSearch] = useState(false)
    const [locations, setLocation] = useState([])
    const [weather, setWeather] = useState({})
    const [loading, setLoading] = useState(true)

    const handleLocation = (loc) => {
        // console.log('location ', loc);
        setLocation([]);
        toggleSearch(false);
        setLoading(true)
        fetchWeatherForecast({
            cityName: loc.name,
            days: '7'
        }).then(data => {
            setWeather(data);
            setLoading(false)
            storeData('city', loc.name);
            // console.log('got forecast ', data);
        })
    }

    const handleSearch = value => {
        // fetch url
        if (value.length > 2) {
            fetchLocations({ cityName: value }).then(data => {
                setLocation(data);
            })
        }
    }

    useEffect(() => {
        fetchMyWeatherData();
    }, [])

    const fetchMyWeatherData = async () => {
        let myCity = await getData('city');
        let cityName = 'Mumbai';
        if (myCity) cityName = myCity

        fetchWeatherForecast({
            cityName,
            days: '7'
        }).then(data => {
            setWeather(data);
            setLoading(false)
        })
    }
    const handleTextDebounce = useCallback(debounce(handleSearch, 1200), [])

    const { current, location } = weather;

    return (
        <View style={[tw.flex1, tw.relative, { backgroundColor: '#072b33' }]}>
            <StatusBar backgroundColor={'#072b33'} />
            {
                loading ? (
                    <View style={[tw.flex1, tw.flexRow, tw.justifyCenter, tw.itemsCenter]}>
                        <Progress.CircleSnail thickness={10} size={140} color={'#0bb3b2'}/>
                    </View>
                ) : (

                    <SafeAreaView style={[tw.flex, tw.flex1]}>
                        <View style={[tw.mX4, tw.relative, tw.z50, { height: '7%' }]}>
                            <View style={[tw.flexRow, tw.justifyEnd, tw.itemsCenter, tw.roundedFull, { backgroundColor: showSearch ? 'black' : 'transparent' }]}>
                                {
                                    showSearch ? (
                                        <TextInput placeholder="Search City" placeholderTextColor={'white'} style={[tw.pL6,
                                        tw.h10, tw.flex1, tw.textBase, tw.textWhite, tw.pB1]} onChangeText={handleTextDebounce} />
                                    ) : null
                                }
                                <TouchableOpacity onPress={() => toggleSearch(!showSearch)} style={[{ backgroundColor: theme.bgWhite(0.3) }, tw.roundedFull, tw.p3, tw.m1]}>
                                    <MagnifyingGlassIcon size={25} color={'white'} />
                                </TouchableOpacity>
                            </View>
                            {
                                locations.length > 0 && showSearch ? (
                                    <View style={[tw.absolute, tw.bgGray300, tw.wFull, { marginTop: '20%', borderRadius: 20 }]}>
                                        {
                                            locations.map((loc, index) => {
                                                return (
                                                    <TouchableOpacity key={index} style={[tw.flexRow, tw.itemsCenter, tw.border0, tw.p3, tw.pX4, tw.mB1, { borderBottomWidth: index + 1 != locations.length ? 2 : 0, borderBottomColor: '#95989a' }]} onPress={() => handleLocation(loc)}>
                                                        <MapPinIcon size={20} color={'gray'} />
                                                        <Text style={[tw.textLg, tw.textBlack, tw.mL2]}>{loc?.name}, {loc?.country}</Text>
                                                    </TouchableOpacity>
                                                )
                                            })
                                        }
                                    </View>
                                ) : null
                            }
                        </View>

                        {/* forecast section */}
                        <View style={[tw.flex1, tw.flex, tw.justifyAround, tw.mX4, tw.mB4]}>
                            <Text style={[tw.textWhite, tw.textCenter, tw.fontSemibold, tw.text2xl]}>{location?.name},
                                <Text style={[tw.textLg, tw.fontSemibold, tw.textGray300]}>{" " + location?.country}</Text></Text>
                            {/* weather image */}
                            <View style={[tw.flexRow, tw.justifyCenter]}>
                                {/* <Image source={{uri: 'https:'+current?.condition?.icon}} /> */}
                                <Image source={weatherImages[current?.condition?.text]} style={{ height: 200, width: 200 }} />
                            </View>
                            {/* degree celcius */}
                            <View style={{ marginVertical: 2 }}>
                                <Text style={[tw.textCenter, tw.fontBold, tw.textWhite, tw.text6xl, tw.mL5]}>{current?.temp_c}&#176;</Text>
                                <Text style={[tw.textCenter, tw.textWhite, tw.textXl, tw.trackingWidest]}>{current?.condition?.text}</
                                Text>
                            </View>
                            {/* other states */}
                            <View style={[tw.flexRow, tw.justifyBetween, tw.mX4, {marginTop: 30}]}>
                                <View style={[tw.flexRow, tw.itemsCenter, { marginHorizontal: 2 }]}>
                                    <Image source={require('../../assets/windy.png')} style={[tw.h6, tw.w6, tw.tintWhite]} />
                                    <Text style={[tw.textWhite, tw.fontSemibold, tw.textBase, tw.mL2]}>{current?.wind_kph}km</Text>
                                </View>
                                <View style={[tw.flexRow, tw.itemsCenter, { marginHorizontal: 2 }]}>
                                    <Image source={require('../../assets/drop.png')} style={[tw.h6, tw.w6, tw.
                                        tintWhite]} />
                                    <Text style={[tw.textWhite, tw.fontSemibold, tw.textBase, tw.mL2]}>{current?.humidity}%</Text>
                                </View>

                                <View style={[tw.flexRow, tw.itemsCenter, { marginHorizontal: 2 }]}>
                                    <Image source={require('../../assets/sun.png')} style={[tw.h6, tw.w6, tw.
                                        tintWhite]} />
                                    <Text style={[tw.textWhite, tw.fontSemibold, tw.textBase, tw.mL2]}>{weather?.forecast?.forecastday[0]?.astro?.sunrise}</Text>
                                </View>
                            </View>
                        </View>

                        {/* forcast for next days */}
                        <View style={[tw.mB2, { marginVertical: 3 }]}>
                            <View style={[tw.flexRow, tw.itemsCenter, tw.mX5]}>
                                <CalendarIcon size={22} color={'white'} />
                                <Text style={[tw.textWhite, tw.textBase, { marginHorizontal: 10 }]}>Daily forcast</Text>
                            </View>
                            <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} style={{ paddingHorizontal: 15 }}>
                                {
                                    weather?.forecast?.forecastday?.map((item, index) => {
                                        let date = new Date(item.date);
                                        let options = { weekday: 'long' };
                                        let dayName = date.toLocaleDateString('en-US', options)
                                        dayName = dayName.split(',')[0].trim()
                                        return (
                                            <View key={index} style={[tw.flex, tw.itemsCenter, tw.justifyCenter, tw.w24, tw.pY3, tw.mR4, {
                                                marginVertical: 2, backgroundColor: theme.bgWhite(0.15), borderRadius: 25, marginTop:
                                                    10
                                            }]}>
                                                <Image source={weatherImages[item?.day?.condition?.text]} style={{
                                                    height: 50, width:
                                                        50
                                                }} />
                                                <Text style={[tw.textWhite]}>{dayName}</Text>
                                                <Text style={[tw.textWhite, tw.textXl, tw.fontSemibold]}>{item?.day?.avgtemp_c}&#176;</Text>
                                            </View>
                                        )
                                    })
                                }
                            </ScrollView>
                        </View>
                    </SafeAreaView>
                )
            }
        </View>
    )
}