module Panwriter.Settings where

import Prelude
import Effect (Effect)
import Panwriter.Toolbar (ViewSplit(..), viewSplit)

type UiPreferences = {
        splitState :: String,
        paginated :: Boolean
    }

type Preferences = {
        ui :: UiPreferences
    }

foreign import getDataDir :: String
foreign import getDataDirFileName :: String -> String
foreign import getPreferences :: Unit -> Preferences

foreign import setPreferenceString :: String -> String -> Effect Unit
foreign import setPreferenceBoolean :: String -> Boolean -> Effect Unit

type AppState = {
    text :: String
    , fileName :: String
    , fileDirty :: Boolean
    , split :: ViewSplit
    , paginated :: Boolean
    }

getAppInitialState :: Unit -> AppState
getAppInitialState x = do
  let cfg = getPreferences unit
  { text: ""
      , fileName: "Untitled"
      , fileDirty: false
      , split: viewSplit cfg.ui.splitState
      , paginated: cfg.ui.paginated
  }

changeSplitViewPref :: ViewSplit -> Effect Unit
changeSplitViewPref OnlyEditor = setPreferenceString "ui.splitState" "OnlyEditor"
changeSplitViewPref Split = setPreferenceString "ui.splitState" "Split"
changeSplitViewPref OnlyPreview = setPreferenceString "ui.splitState" "OnlyPreview"

changePaginatedPref :: Boolean -> Effect Unit
changePaginatedPref x = setPreferenceBoolean "ui.paginated" x