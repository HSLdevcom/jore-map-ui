const textCodeList = {
    login_isLoading: 'Ladataan sovellusta...',
    login_isLoggingIn: 'Kirjaudutaan sisään...',
    login_hasBackendConnectionError:
        'Taustajärjestelmään ei saatu yhteyttä, Jore-map on mahdollisesti pois käytöstä. Yritä päivittää sivu uudelleen tai ongelmien jatkuessa ota yhteyttä sovelluksen ylläpitäjään. Huom. dev ja stage ympäristöt ovat käytettävissä arkisin toimistoaikoina: 8.00 - 18.00.',
    login_failed_user_has_no_access_permission:
        'Kirjautuminen epäonnistui. Käyttäjätunnustasi ei ole vielä hyväksytty HSL:n puolesta.',
    login_failed_no_jore_username:
        'Kirjautuminen epäonnistui, käyttäjänimeä ei löytynyt joukkoliikennerekisterin tietokannasta HSL-id:stä saadun sähköpostiosoitteen ${email} avulla.  Ota yhteyttä joukkoliikennerekisterin käyttäjätunnusten hallinnoijaan.',
    no_access_token: 'Kirjautuminen epäonnistui, HSL-id kirjautuminen ei antanut access tokenia.',
    savePrevented_isNotDirty: 'Ei tallennettavia muutoksia.',
    routePath_savePrevented_isEditingDisabled:
        'Tallennus estetty, editointi ei ole päällä. Aloita editointi ja tee muutoksia, jonka jälkeen voit tallentaa.',
    routePath_savePrevented_routePathLinksMissing:
        'Tallennus estetty, reitinsuunnan linkit puuttuvat.',
    routePath_savePrevented_geometryInvalid:
        'Tallennus estetty, reitinsuunnan geometria on epävalidi.',
    routePath_savePrevented_stopAppearingTwice:
        'Tallennus estetty, pysäkki ${stopId} esiintyy kahdesti. Jos käytät samaa pysäkkiä kahdesti, vähintään toisen pysäkin täytyy olla poissa käytöstä.',
    routePath_savePrevented_startNodeTheSameAsEndNode:
        'Tallennus estetty, reitinsuunnan alkusolmu on sama kuin sen loppusolmu.',
    routePath_savePrevented_checkRoutePathInfoTab:
        'Tallennus estetty, tarkista reitinsuunnan tiedot sekä pysäkkien tiedot.',
};

export default textCodeList;
