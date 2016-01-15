<?xml version="1.0" encoding="UTF-8"?>
<sld:UserStyle xmlns="http://www.opengis.net/sld" xmlns:sld="http://www.opengis.net/sld" xmlns:ogc="http://www.opengis.net/ogc" xmlns:gml="http://www.opengis.net/gml">
  <sld:Name>adonm_test_current_editable</sld:Name>
  <sld:Title/>
  <sld:FeatureTypeStyle>
    <sld:Name>name</sld:Name>
    <sld:Rule>
      <sld:Name>Red Fill</sld:Name>
      <sld:Title>Red Fill</sld:Title>
      <ogc:Filter>
        <ogc:PropertyIsGreaterThan>
          <ogc:PropertyName>age</ogc:PropertyName>
          <ogc:Literal>3</ogc:Literal>
        </ogc:PropertyIsGreaterThan>
      </ogc:Filter>
      <sld:PointSymbolizer>
        <sld:Graphic>
          <sld:Mark>
            <sld:WellKnownName>circle</sld:WellKnownName>
            <sld:Fill>
              <sld:CssParameter name="fill">#FF0000</sld:CssParameter>
              <sld:CssParameter name="fill-opacity">0.7</sld:CssParameter>
            </sld:Fill>
            <sld:Stroke>
              <sld:CssParameter name="stroke-opacity">0.7</sld:CssParameter>
              <sld:CssParameter name="stroke-width">2</sld:CssParameter>
            </sld:Stroke>
          </sld:Mark>
          <sld:Size>
            <ogc:Literal>24</ogc:Literal>
          </sld:Size>
        </sld:Graphic>
      </sld:PointSymbolizer>
    </sld:Rule>
    <sld:Rule>
      <sld:Name>Yellow Fill</sld:Name>
      <sld:Title>Yellow Fill</sld:Title>
      <ogc:Filter>
        <ogc:PropertyIsLessThanOrEqualTo>
          <ogc:PropertyName>age</ogc:PropertyName>
          <ogc:Literal>3</ogc:Literal>
        </ogc:PropertyIsLessThanOrEqualTo>
      </ogc:Filter>
      <sld:PointSymbolizer>
        <sld:Graphic>
          <sld:Mark>
            <sld:WellKnownName>circle</sld:WellKnownName>
            <sld:Fill>
              <sld:CssParameter name="fill">#FFFF00</sld:CssParameter>
              <sld:CssParameter name="fill-opacity">0.7</sld:CssParameter>
            </sld:Fill>
            <sld:Stroke>
              <sld:CssParameter name="stroke-opacity">0.7</sld:CssParameter>
              <sld:CssParameter name="stroke-width">2</sld:CssParameter>
            </sld:Stroke>
          </sld:Mark>
          <sld:Size>
            <ogc:Literal>24</ogc:Literal>
          </sld:Size>
        </sld:Graphic>
      </sld:PointSymbolizer>
    </sld:Rule>
    <sld:Rule>
      <sld:Name>Green Fill</sld:Name>
      <sld:Title>Green Fill</sld:Title>
      <ogc:Filter>
        <ogc:PropertyIsLessThanOrEqualTo>
          <ogc:PropertyName>age</ogc:PropertyName>
          <ogc:Literal>1</ogc:Literal>
        </ogc:PropertyIsLessThanOrEqualTo>
      </ogc:Filter>
      <sld:PointSymbolizer>
        <sld:Graphic>
          <sld:Mark>
            <sld:WellKnownName>circle</sld:WellKnownName>
            <sld:Fill>
              <sld:CssParameter name="fill">#00FF00</sld:CssParameter>
              <sld:CssParameter name="fill-opacity">0.7</sld:CssParameter>
            </sld:Fill>
            <sld:Stroke>
              <sld:CssParameter name="stroke-opacity">0.7</sld:CssParameter>
              <sld:CssParameter name="stroke-width">2</sld:CssParameter>
            </sld:Stroke>
          </sld:Mark>
          <sld:Size>
            <ogc:Literal>24</ogc:Literal>
          </sld:Size>
        </sld:Graphic>
      </sld:PointSymbolizer>
    </sld:Rule>
    <sld:Rule>
      <sld:PointSymbolizer>
        <sld:Graphic>
          <sld:ExternalGraphic>
            <sld:OnlineResource xmlns:xlink="http://www.w3.org/1999/xlink" xlink:type="simple" xlink:href="http://localhost/static/build/symbols/${symbol}_64.png"/>
            <sld:Format>image/png</sld:Format>
          </sld:ExternalGraphic>
          <sld:Size>
            <ogc:Literal>24</ogc:Literal>
          </sld:Size>
        </sld:Graphic>
      </sld:PointSymbolizer>
    </sld:Rule>
    <sld:Rule>
      <sld:Name>Labels</sld:Name>
      <sld:TextSymbolizer>
        <sld:Geometry>
          <ogc:PropertyName>wkb_geometry</ogc:PropertyName>
        </sld:Geometry>
        <sld:Label>
              <ogc:PropertyName>callsign</ogc:PropertyName>
            (<ogc:PropertyName>name</ogc:PropertyName>)
        </sld:Label>
        <sld:Font>
          <sld:CssParameter name="font-family">Arial</sld:CssParameter>
          <sld:CssParameter name="font-size">10.0</sld:CssParameter>
          <sld:CssParameter name="font-style">normal</sld:CssParameter>
          <sld:CssParameter name="font-weight">normal</sld:CssParameter>
        </sld:Font>
        <sld:LabelPlacement>
          <sld:PointPlacement>
            <sld:AnchorPoint>
              <sld:AnchorPointX>
                <ogc:Literal>0</ogc:Literal>
              </sld:AnchorPointX>
              <sld:AnchorPointY>
                <ogc:Literal>0.5</ogc:Literal>
              </sld:AnchorPointY>
            </sld:AnchorPoint>
            <sld:Displacement>
              <sld:DisplacementX>
                <ogc:Literal>16</ogc:Literal>
              </sld:DisplacementX>
              <sld:DisplacementY>
                <ogc:Literal>0.0</ogc:Literal>
              </sld:DisplacementY>
            </sld:Displacement>
            <sld:Rotation>
              <ogc:Literal>0</ogc:Literal>
            </sld:Rotation>
          </sld:PointPlacement>
        </sld:LabelPlacement>
        <sld:Halo>
          <sld:Radius>
            <ogc:Literal>2.0</ogc:Literal>
          </sld:Radius>
          <sld:Fill>
            <sld:CssParameter name="fill">#FFFFFF</sld:CssParameter>
            <sld:CssParameter name="fill-opacity">0.8</sld:CssParameter>
          </sld:Fill>
        </sld:Halo>
        <sld:Fill>
          <sld:CssParameter name="fill">#000000</sld:CssParameter>
        </sld:Fill>
      </sld:TextSymbolizer>
    </sld:Rule>
  </sld:FeatureTypeStyle>
</sld:UserStyle>
