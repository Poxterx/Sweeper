<?xml version="1.0" encoding="UTF-8"?>
<tileset version="1.2" tiledversion="1.2.0" name="Test" tilewidth="128" tileheight="128" tilecount="18" columns="6">
 <image source="test_tileset.png" width="768" height="384"/>
 <terraintypes>
  <terrain name="Wall" tile="14"/>
 </terraintypes>
 <tile id="1" terrain=",,,0"/>
 <tile id="2" terrain=",,0,0"/>
 <tile id="3" terrain=",,0,"/>
 <tile id="4" terrain="0,0,0,"/>
 <tile id="5" terrain="0,0,,0"/>
 <tile id="7" terrain=",0,,0"/>
 <tile id="8" terrain="0,0,0,0"/>
 <tile id="9" terrain="0,,0,"/>
 <tile id="10" terrain="0,,0,0"/>
 <tile id="11" terrain=",0,0,0">
  <objectgroup draworder="index">
   <object id="4" x="0" y="0" width="128" height="128"/>
  </objectgroup>
 </tile>
 <tile id="13" terrain=",0,,"/>
 <tile id="14" terrain="0,0,,"/>
 <tile id="15" terrain="0,,,"/>
</tileset>
