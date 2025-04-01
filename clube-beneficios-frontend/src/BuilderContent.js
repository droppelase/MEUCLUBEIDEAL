// src/BuilderContent.js
import React from 'react';
import { BuilderComponent, builder } from '@builder.io/react';

builder.init('2aa876888b274dd7857c499b5ca4bc05');

function BuilderContent({ model = 'page', content }) {
  return (
    <div>
      <BuilderComponent model={model} content={content} />
    </div>
  );
}

export default BuilderContent;
