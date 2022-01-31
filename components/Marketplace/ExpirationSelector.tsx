import React, { FC } from 'react'

type Props = {
  presets: {
    preset: string
    value: () => string
    display: string
  }[]
  expiration: string
  setExpiration: React.Dispatch<React.SetStateAction<string>>
}

const ExpirationSelector: FC<Props> = ({
  presets,
  expiration,
  setExpiration,
}) => {
  return (
    <>
      <label
        htmlFor="expirationSelector"
        className="mb-2 font-medium uppercase opacity-75"
      >
        Expiration
      </label>

      <select
        name="expiration"
        id="expirationSelector"
        defaultValue={expiration}
        onChange={(e) => setExpiration(e.target.value)}
        className="input-blue-outline"
      >
        {presets.map(({ preset, display }) => (
          <option key={preset} value={preset}>
            {display}
          </option>
        ))}
      </select>
    </>
  )
}

export default ExpirationSelector