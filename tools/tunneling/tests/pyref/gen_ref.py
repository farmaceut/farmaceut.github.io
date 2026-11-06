# Reference values from the author's Python package (read-only use). Usage: python3 -I gen_ref.py <family> <V1> <dE> <nu> [T...]
import sys, json, math, time, warnings
import os
PROJ = os.environ.get('TUNNELING_PROJECT', './Tunneling')   # folder of the unpacked Python package
sys.path.insert(0, PROJ); sys.path.insert(0, PROJ + '/validation')
warnings.simplefilter('ignore')
import numpy as np
from validation.exact_1d import kappa_from_transmission
from validation.shapes import matched_barrier, _nu_from_d2
from methods.eckart import kappa_eckart
from methods.wigner import Wigner
from methods.skodje_truhlar import kappa_skodje_truhlar_closed
from methods.zct import ZCT
from methods.own import kappa_zct_ec, effective_frequency, kappa_eq_freq
from analysis.benchmark_v3 import box

fam, V1t, dEt, nut = sys.argv[1], float(sys.argv[2]), float(sys.argv[3]), float(sys.argv[4])
temps = [float(t) for t in sys.argv[5:]] or [200.0, 298.15, 400.0]
t0 = time.time()
b, _ = matched_barrier(fam, V1t, V1t - dEt, nut)
w = b.width; L = box(fam, w)
vtop = float(b.V(np.linspace(-3*w, 3*w, 200001)).max())
vl, vr = float(b.V(np.array([-L]))[0]), float(b.V(np.array([L]))[0])
V1, V2 = vtop - vl, vtop - vr
h2 = 2e-3*w; xt = np.linspace(-3*w, 3*w, 200001); it = int(np.argmax(b.V(xt)))
d2 = (b.V(np.array([xt[it]+h2]))[0] - 2*b.V(np.array([xt[it]]))[0] + b.V(np.array([xt[it]-h2]))[0]) / h2**2
nu = _nu_from_d2(float(d2))
ke, _ = kappa_from_transmission(b.V, V1, V2, temps, L=L, h0=0.004, tmax=max(temps))
x = np.linspace(-L, L, 8001 if L < 30 else 16001)
z = ZCT(x, b.V(x), nu_imag=nu); zw = ZCT(x, b.V(x), nu_imag=nu, variant='wkb')
out = dict(family=fam, V1t=V1t, dEt=dEt, nut=nut, w=w, V0=b.V0, L=L, V1=V1, V2=V2, nu=nu, zV1=z.V1, zV2=z.V2, T=temps, exact=[float(k) for k in ke],
           wigner=[Wigner(nu).kappa(T) for T in temps], parab=[kappa_skodje_truhlar_closed(min(V1, V2), nu, T) for T in temps],
           eckart=[kappa_eckart(V1, V2, nu, T) for T in temps], zct=[z.kappa(T) for T in temps], zctwkb=[zw.kappa(T) for T in temps],
           zctec=[kappa_zct_ec(z, T) for T in temps], eq=[kappa_eq_freq(z, T) for T in temps], nueff=[effective_frequency(z, T)[0] for T in temps],
           seconds=time.time() - t0)
json.dump(out, open(f'ref_{fam}_{V1t:g}_{dEt:g}_{nut:g}.json', 'w'), indent=1)
print(fam, 'done in %.1f s' % out['seconds'], 'V1,V2,nu', V1, V2, nu, 'exact', out['exact'])
