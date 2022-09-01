import React from 'react';
import {
  BottomTabNavigationOptions,
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components/native';

import {
  HomeIcon,
  IconType,
  ProfileIcon,
  FilmCameraIcon,
} from '../../common/components/Icons';
import {COLORS} from '../../common/constants/colors';
import {RootStackRoutes} from '../../common/constants/routes';
import {SPACINGS} from '../../common/constants/spacings';
import {B3} from '../../common/components/Typography/Text/Text';

import Home from '../../routes/Home/Home';
import Profile from '../../routes/Profile/Profile';
import Temples from '../../routes/Temples/Temples';

import NS from '../i18n/constants/namespaces';

const Tab = createBottomTabNavigator();

type TabBarLabelProps = {
  readonly color: string;
};
const TabBarLabel = styled(B3)<TabBarLabelProps>(({color}) => ({
  color,
}));

const tabBarOptions: BottomTabNavigationOptions = {
  headerShown: false,
  tabBarShowLabel: true,
  tabBarHideOnKeyboard: true,
  tabBarAllowFontScaling: false,
  tabBarActiveTintColor: COLORS.GREY600,
  tabBarInactiveTintColor: COLORS.GREY,
  tabBarItemStyle: {
    paddingTop: SPACINGS.TWENTY,
  },
  tabBarStyle: {
    elevation: 0,
    height: 100,
    borderTopWidth: 0.5,
    borderTopColor: COLORS.GREY,
    backgroundColor: 'transparent',
  },
};

const getTabOptions: (
  Icon: IconType,
  label: string,
) => BottomTabNavigationOptions = (Icon, label) => ({
  tabBarIcon: ({color}) => <Icon fill={color} />,
  tabBarLabel: ({color}) => <TabBarLabel color={color}>{label}</TabBarLabel>,
});

const Tabs = () => {
  const {t} = useTranslation(NS.COMPONENT.TABS);
  return (
    <Tab.Navigator screenOptions={tabBarOptions}>
      <Tab.Screen
        name={RootStackRoutes.HOME}
        component={Home}
        options={getTabOptions(HomeIcon, t('home'))}
      />
      <Tab.Screen
        name={RootStackRoutes.PROFILE}
        component={Profile}
        options={getTabOptions(ProfileIcon, t('profile'))}
      />
      <Tab.Screen
        name={RootStackRoutes.TEMPLES}
        component={Temples}
        options={getTabOptions(FilmCameraIcon, t('video'))}
      />
    </Tab.Navigator>
  );
};

export default Tabs;
